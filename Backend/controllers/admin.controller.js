const Admin = require("../models/Admin");
const Rider = require("../models/Rider");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const PDFDocument = require("pdfkit");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require("../utils/sendEmail");
const { createNotification } = require("../services/notification.service");
const { auditLog } = require("../services/audit.service");
const { assertValidObjectId } = require("../utils/objectId");

const validChartPeriods = ["daily", "weekly", "monthly"];
const validRetentionWindows = [7, 30, 90, 180];
const analyticsSections = ["all", "revenue", "orders", "users", "drivers", "performance"];
const analyticsFormats = ["json", "pdf", "excel"];
const activeOrderStatuses = ["PLACED", "CONFIRMED", "PREPARING", "PREPARED", "PICKED_UP", "ON_THE_WAY"];
const completedOrderStatus = "DELIVERED";
const cancelledOrderStatus = "CANCELLED";
const platformCommissionRate = 0.30;
const peakHourSlots = [
  { label: "12pm", startHour: 12, endHour: 14 },
  { label: "2pm", startHour: 14, endHour: 16 },
  { label: "4pm", startHour: 16, endHour: 18 },
  { label: "6pm", startHour: 18, endHour: 20 }
];
const weekDayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  return `"${String(value).replace(/"/g, "\"\"")}"`;
};

const toCsv = (rows, columns) => {
  const header = columns.map((column) => csvEscape(column)).join(",");
  const lines = rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","));
  return [header, ...lines].join("\n");
};

const getCommissionExpression = () => ({
  $multiply: [
    {
      $max: [
        {
          $subtract: [
            { $ifNull: ["$pricing.grandTotal", 0] },
            { $ifNull: ["$pricing.deliveryFee", 0] }
          ]
        },
        0
      ]
    },
    platformCommissionRate
  ]
});

const getDateFormatForGranularity = (granularity) => {
  if (granularity === "monthly") return "%Y-%m";
  if (granularity === "weekly") return "%Y-%U";
  return "%Y-%m-%d";
};

const inferGranularity = (startDate, endDate) => {
  const rangeMs = endDate.getTime() - startDate.getTime();
  const rangeDays = Math.max(1, Math.ceil(rangeMs / (24 * 60 * 60 * 1000)));

  if (rangeDays > 180) return "monthly";
  if (rangeDays > 60) return "weekly";
  return "daily";
};

const parseAnalyticsRequest = (query) => {
  const section = String(query.section || "all").trim().toLowerCase();
  const format = String(query.format || "json").trim().toLowerCase();

  if (!analyticsSections.includes(section)) {
    throw new ApiError(400, `section must be one of: ${analyticsSections.join(", ")}`);
  }

  if (!analyticsFormats.includes(format)) {
    throw new ApiError(400, `format must be one of: ${analyticsFormats.join(", ")}`);
  }

  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  if (Number.isNaN(endDate.getTime())) {
    throw new ApiError(400, "Invalid endDate");
  }

  endDate.setHours(23, 59, 59, 999);

  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(startDate.getTime())) {
    throw new ApiError(400, "Invalid startDate");
  }

  startDate.setHours(0, 0, 0, 0);

  if (startDate > endDate) {
    throw new ApiError(400, "startDate must be earlier than or equal to endDate");
  }

  const requestedGranularity = query.granularity
    ? String(query.granularity).trim().toLowerCase()
    : inferGranularity(startDate, endDate);

  if (!validChartPeriods.includes(requestedGranularity)) {
    throw new ApiError(400, "granularity must be one of: daily, weekly, monthly");
  }

  const periodMs = endDate.getTime() - startDate.getTime() + 1;
  const previousStartDate = new Date(startDate.getTime() - periodMs);
  const previousEndDate = new Date(startDate.getTime() - 1);

  return {
    section,
    format,
    granularity: requestedGranularity,
    startDate,
    endDate,
    previousStartDate,
    previousEndDate
  };
};

const buildOrderMatch = (startDate, endDate, extra = {}) => ({
  createdAt: { $gte: startDate, $lte: endDate },
  ...extra
});

const buildUserMatch = (startDate, endDate, extra = {}) => ({
  createdAt: { $gte: startDate, $lte: endDate },
  ...extra
});

const getPercentageChange = (currentValue, previousValue) => {
  if (!previousValue && !currentValue) return 0;
  if (!previousValue) return 100;
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(2));
};

const buildTrendMeta = (currentValue, previousValue) => {
  const change = getPercentageChange(currentValue, previousValue);

  return {
    value: currentValue,
    previousValue,
    changePercentage: change,
    direction: change === 0 ? "neutral" : change > 0 ? "up" : "down"
  };
};

const calculatePeakHourMatrix = async (startDate, endDate) => {
  const rows = await Order.aggregate([
    {
      $match: buildOrderMatch(startDate, endDate)
    },
    {
      $project: {
        dayOfWeek: { $isoDayOfWeek: "$createdAt" },
        hourOfDay: { $hour: "$createdAt" }
      }
    },
    {
      $group: {
        _id: {
          dayOfWeek: "$dayOfWeek",
          hourOfDay: "$hourOfDay"
        },
        orderCount: { $sum: 1 }
      }
    }
  ]);

  const valueMap = new Map();
  for (const row of rows) {
    valueMap.set(`${row._id.dayOfWeek}-${row._id.hourOfDay}`, row.orderCount);
  }

  const matrix = peakHourSlots.map((slot) => ({
    time: slot.label,
    values: weekDayLabels.map((dayLabel, dayIndex) => {
      let total = 0;

      for (let hour = slot.startHour; hour < slot.endHour; hour += 1) {
        total += valueMap.get(`${dayIndex + 1}-${hour}`) || 0;
      }

      return {
        day: dayLabel,
        orderCount: total
      };
    })
  }));

  const highestValue = Math.max(
    0,
    ...matrix.flatMap((slot) => slot.values.map((entry) => entry.orderCount))
  );

  return matrix.map((slot) => ({
    time: slot.time,
    values: slot.values.map((entry) => ({
      ...entry,
      intensity: highestValue ? Number((entry.orderCount / highestValue).toFixed(2)) : 0
    }))
  }));
};

const buildAnalyticsCsvRows = (payload) => {
  const rows = [];
  const { generatedAt, range, summaryCards, activeSection, activeSectionData } = payload;

  rows.push({
    recordType: "summary",
    section: activeSection,
    generatedAt,
    startDate: range.startDate,
    endDate: range.endDate,
    metric: "totalRevenue",
    value: summaryCards.totalRevenue.value,
    previousValue: summaryCards.totalRevenue.previousValue,
    changePercentage: summaryCards.totalRevenue.changePercentage
  });
  rows.push({
    recordType: "summary",
    section: activeSection,
    generatedAt,
    startDate: range.startDate,
    endDate: range.endDate,
    metric: "activeOrders",
    value: summaryCards.activeOrders.value,
    previousValue: summaryCards.activeOrders.previousValue,
    changePercentage: summaryCards.activeOrders.changePercentage
  });
  rows.push({
    recordType: "summary",
    section: activeSection,
    generatedAt,
    startDate: range.startDate,
    endDate: range.endDate,
    metric: "avgOrderValue",
    value: summaryCards.avgOrderValue.value,
    previousValue: summaryCards.avgOrderValue.previousValue,
    changePercentage: summaryCards.avgOrderValue.changePercentage
  });
  rows.push({
    recordType: "summary",
    section: activeSection,
    generatedAt,
    startDate: range.startDate,
    endDate: range.endDate,
    metric: "newUsers",
    value: summaryCards.newUsers.value,
    previousValue: summaryCards.newUsers.previousValue,
    changePercentage: summaryCards.newUsers.changePercentage
  });

  const chartKey = activeSection === "performance" ? "trends" : "chart";

  if (Array.isArray(activeSectionData?.[chartKey])) {
    activeSectionData[chartKey].forEach((point) => {
      rows.push({
        recordType: "chart",
        section: activeSection,
        generatedAt,
        startDate: range.startDate,
        endDate: range.endDate,
        metric: point.label || "",
        value: point.gross ?? point.totalOrders ?? point.newUsers ?? point.deliveries ?? 0,
        previousValue: point.net ?? point.activeOrders ?? point.earnings ?? point.deliveredOrders ?? 0,
        changePercentage: ""
      });
    });
  }

  if (Array.isArray(activeSectionData?.peakHours)) {
    activeSectionData.peakHours.forEach((slot) => {
      slot.values.forEach((entry) => {
        rows.push({
          recordType: "peakHour",
          section: activeSection,
          generatedAt,
          startDate: range.startDate,
          endDate: range.endDate,
          metric: `${slot.time}-${entry.day}`,
          value: entry.orderCount,
          previousValue: entry.intensity,
          changePercentage: ""
        });
      });
    });
  }

  return rows;
};

const writeAnalyticsPdfExport = (res, payload, section) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const fileName = `admin-analytics-${section}-${payload.range.startDate.slice(0, 10)}-${payload.range.endDate.slice(0, 10)}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);

  doc.fontSize(18).text("Platform Analytics Report", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Generated At: ${payload.generatedAt}`);
  doc.text(`Section: ${payload.activeSection}`);
  doc.text(`Range: ${payload.range.startDate} to ${payload.range.endDate}`);
  doc.text(`Granularity: ${payload.range.granularity}`);

  doc.moveDown();
  doc.fontSize(13).text("Summary");
  doc.fontSize(10);
  doc.text(`Total Revenue: ${payload.summaryCards.totalRevenue.value}`);
  doc.text(`Active Orders: ${payload.summaryCards.activeOrders.value}`);
  doc.text(`Average Order Value: ${payload.summaryCards.avgOrderValue.value}`);
  doc.text(`New Users: ${payload.summaryCards.newUsers.value}`);

  doc.moveDown();
  doc.fontSize(13).text(`${payload.activeSection[0].toUpperCase()}${payload.activeSection.slice(1)} Section`);
  doc.fontSize(10);

  const chartKey = payload.activeSection === "performance" ? "trends" : "chart";

  if (Array.isArray(payload.activeSectionData?.[chartKey]) && payload.activeSectionData[chartKey].length) {
    payload.activeSectionData[chartKey].slice(0, 10).forEach((point) => {
      doc.text(
        `${point.label || ""}: primary=${point.gross ?? point.totalOrders ?? point.newUsers ?? point.deliveries ?? 0}, secondary=${point.net ?? point.activeOrders ?? point.earnings ?? point.deliveredOrders ?? 0}`
      );
    });
  }

  if (Array.isArray(payload.activeSectionData?.peakHours) && payload.activeSectionData.peakHours.length) {
    doc.moveDown(0.5);
    doc.text("Peak Hours");
    payload.activeSectionData.peakHours.forEach((slot) => {
      const formatted = slot.values.map((entry) => `${entry.day}:${entry.orderCount}`).join("  ");
      doc.text(`${slot.time} -> ${formatted}`);
    });
  }

  doc.end();
};

const writeAnalyticsExcelExport = (res, payload, section) => {
  const rows = buildAnalyticsCsvRows(payload);
  const columns = [
    "recordType",
    "section",
    "generatedAt",
    "startDate",
    "endDate",
    "metric",
    "value",
    "previousValue",
    "changePercentage"
  ];
  const csvData = toCsv(rows, columns);
  const fileName = `admin-analytics-${section}-${payload.range.startDate.slice(0, 10)}-${payload.range.endDate.slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "application/vnd.ms-excel");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(csvData);
};

const getSectionPayload = async ({ startDate, endDate, previousStartDate, previousEndDate, granularity, section }) => {
  const currentOrderMatch = buildOrderMatch(startDate, endDate);
  const previousOrderMatch = buildOrderMatch(previousStartDate, previousEndDate);
  const currentUserMatch = buildUserMatch(startDate, endDate);
  const previousUserMatch = buildUserMatch(previousStartDate, previousEndDate);
  const groupFormat = getDateFormatForGranularity(granularity);

  const [
    currentDeliveredSummary,
    previousDeliveredSummary,
    currentActiveOrders,
    previousActiveOrders,
    currentNewUsers,
    previousNewUsers,
    revenueTrend,
    ordersTrend,
    usersTrend,
    driverTrend,
    peakHours
  ] = await Promise.all([
    Order.aggregate([
      { $match: { ...currentOrderMatch, status: completedOrderStatus } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: { $ifNull: ["$pricing.grandTotal", 0] } },
          platformRevenue: { $sum: getCommissionExpression() },
          deliveredOrders: { $sum: 1 }
        }
      }
    ]),
    Order.aggregate([
      { $match: { ...previousOrderMatch, status: completedOrderStatus } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: { $ifNull: ["$pricing.grandTotal", 0] } },
          platformRevenue: { $sum: getCommissionExpression() },
          deliveredOrders: { $sum: 1 }
        }
      }
    ]),
    Order.countDocuments({ ...currentOrderMatch, status: { $in: activeOrderStatuses } }),
    Order.countDocuments({ ...previousOrderMatch, status: { $in: activeOrderStatuses } }),
    User.countDocuments(currentUserMatch),
    User.countDocuments(previousUserMatch),
    Order.aggregate([
      { $match: { ...currentOrderMatch, status: completedOrderStatus } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          grossRevenue: { $sum: { $ifNull: ["$pricing.grandTotal", 0] } },
          netRevenue: { $sum: getCommissionExpression() },
          deliveredOrders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]),
    Order.aggregate([
      { $match: currentOrderMatch },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalOrders: { $sum: 1 },
          activeOrders: {
            $sum: {
              $cond: [{ $in: ["$status", activeOrderStatuses] }, 1, 0]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", completedOrderStatus] }, 1, 0]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", cancelledOrderStatus] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]),
    User.aggregate([
      { $match: currentUserMatch },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]),
    Order.aggregate([
      {
        $match: {
          ...currentOrderMatch,
          status: completedOrderStatus,
          rider: { $ne: null }
        }
      },
      {
        $addFields: {
          chartDate: {
            $ifNull: [
              "$deliveredAt",
              "$createdAt"
            ]
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$chartDate" } },
          deliveries: { $sum: 1 },
          earnings: { $sum: { $ifNull: ["$pricing.deliveryFee", 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]),
    calculatePeakHourMatrix(startDate, endDate)
  ]);

  const currentRevenueSummary = currentDeliveredSummary[0] || {
    grossRevenue: 0,
    platformRevenue: 0,
    deliveredOrders: 0
  };
  const previousRevenueSummary = previousDeliveredSummary[0] || {
    grossRevenue: 0,
    platformRevenue: 0,
    deliveredOrders: 0
  };

  const currentAvgOrderValue = currentRevenueSummary.deliveredOrders
    ? Number((currentRevenueSummary.grossRevenue / currentRevenueSummary.deliveredOrders).toFixed(2))
    : 0;
  const previousAvgOrderValue = previousRevenueSummary.deliveredOrders
    ? Number((previousRevenueSummary.grossRevenue / previousRevenueSummary.deliveredOrders).toFixed(2))
    : 0;

  const sections = {
    revenue: {
      chart: revenueTrend.map((entry) => ({
        label: entry._id,
        gross: Number(entry.grossRevenue.toFixed(2)),
        net: Number(entry.netRevenue.toFixed(2))
      }))
    },
    orders: {
      chart: ordersTrend.map((entry) => ({
        label: entry._id,
        totalOrders: entry.totalOrders,
        activeOrders: entry.activeOrders,
        deliveredOrders: entry.deliveredOrders,
        cancelledOrders: entry.cancelledOrders
      }))
    },
    users: {
      chart: usersTrend.map((entry) => ({
        label: entry._id,
        newUsers: entry.newUsers
      }))
    },
    drivers: {
      chart: driverTrend.map((entry) => ({
        label: entry._id,
        deliveries: entry.deliveries,
        earnings: Number(entry.earnings.toFixed(2))
      }))
    },
    performance: {
      trends: revenueTrend.map((entry) => ({
        label: entry._id,
        gross: Number(entry.grossRevenue.toFixed(2)),
        net: Number(entry.netRevenue.toFixed(2))
      })),
      peakHours
    }
  };

  const summaryCards = {
    totalRevenue: buildTrendMeta(
      Number(currentRevenueSummary.grossRevenue.toFixed(2)),
      Number(previousRevenueSummary.grossRevenue.toFixed(2))
    ),
    activeOrders: buildTrendMeta(currentActiveOrders, previousActiveOrders),
    avgOrderValue: buildTrendMeta(currentAvgOrderValue, previousAvgOrderValue),
    newUsers: buildTrendMeta(currentNewUsers, previousNewUsers)
  };

  const tabs = [
    { key: "revenue", label: "Revenue" },
    { key: "orders", label: "Orders" },
    { key: "users", label: "Users" },
    { key: "drivers", label: "Drivers" },
    { key: "performance", label: "Performance" }
  ];

  const selectedSection = section === "all" ? "performance" : section;

  return {
    generatedAt: new Date().toISOString(),
    range: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      previousStartDate: previousStartDate.toISOString(),
      previousEndDate: previousEndDate.toISOString(),
      granularity
    },
    summaryCards,
    tabs,
    activeSection: selectedSection,
    activeSectionData: sections[selectedSection]
  };
};



// @desc    Seed first super admin (run once)
// @route   POST /api/admin/seed
// @access  Public (disable after first use)
const seedAdmin = asyncHandler(async (req, res, next) => {
  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ role: "main-admin" });
  if (existingAdmin) {
    return next(new ApiError(400, "Admin already exists. Seed is disabled."));
  }

  const admin = await Admin.create({
    name: "Super Admin",
    email: "admin@foodorder.com",
    password: "Admin@123",
  });

  const response = new ApiResponse(201, "Admin seeded successfully", {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });

  res.status(201).json(response);
});

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  const token = generateToken(admin, res);

  const response = new ApiResponse(200, "Login successful", {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
  response.token = token;

  res.status(200).json(response);
});

// @desc    Admin logout
// @route   POST /api/admin/logout
// @access  Private (Admin)
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, "Profile fetched", admin));
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const admin = await Admin.findById(req.user._id).select("+password");
  if (!admin) {
    return next(new ApiError(404, "Admin not found"));
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (password) admin.password = password;

  await admin.save();

  res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    })
  );
});

// ================= GET ALL RIDERS =================
const getAllRiders = asyncHandler(async (req, res) => {
  const { availability } = req.query;
  const filter = {};

  if (availability !== undefined) {
    const normalizedAvailability = String(availability).trim().toLowerCase();

    if (!["true", "false"].includes(normalizedAvailability)) {
      throw new ApiError(400, "availability must be true or false");
    }

    filter.isAvailable = normalizedAvailability === "true";
  }

  const riders = await Rider.find(filter).select("-password").sort({ createdAt: -1 });
  await Promise.all(riders.map((rider) => rider.refreshSuspensionStatus()));

  res.status(200).json(
    new ApiResponse(200, "Riders fetched successfully", riders)
  );

});

// ================= VIEW SINGLE RIDER =================
const getSingleRider = asyncHandler(async (req, res) => {

  const { riderId } = req.params;
  assertValidObjectId(riderId, "riderId");

  const rider = await Rider.findById(riderId).select("-password");

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await rider.refreshSuspensionStatus();

  res.status(200).json(
    new ApiResponse(200, "Rider details fetched successfully", rider)
  );

});


// ================= APPROVE RIDER =================
const approveRider = asyncHandler(async (req, res) => {

  const riderId = assertValidObjectId(req.params.id, "riderId");
  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  if (rider.status !== "pending") {
    throw new ApiError(400, "Only pending riders can be approved");
  }

  rider.status = "approved";
  rider.rejectionReason = "";
  rider.suspensionReason = "";
  rider.suspendedAt = null;
  rider.suspendedUntil = null;

  await rider.save();
  // 🔔 Notification
    await createNotification(
    rider._id,
    "rider",
    "Application Approved",
    "Your rider application has been approved. You can now login."
  );

  
  await sendEmail(
    rider.email,
    "Rider Application Approved",
    "Your rider application has been approved. You can now log in to your account."
  );

  await auditLog({
    req,
    action: "RIDER_APPROVED",
    entity: {
      _id: rider._id,
      model: "Rider",
      label: rider.email
    },
    description: "Rider application approved",
    metadata: {
      riderStatus: rider.status
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Rider approved successfully", rider)
  );

});


// ================= REJECT RIDER =================
const rejectRider = asyncHandler(async (req, res) => {

  const riderId = assertValidObjectId(req.params.id, "riderId");
  const rider = await Rider.findById(riderId);
  const { reason } = req.body;

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  const rejectionReason = reason?.trim();

  if (!rejectionReason) {
    throw new ApiError(400, "Rejection reason is required");
  }

  if (rider.status !== "pending") {
    throw new ApiError(400, "Only pending rider applications can be rejected");
  }
  // 🔔 Notification
   await createNotification(
    rider._id,
    "rider",
    "Application Rejected",
    `Your rider application has been rejected. Reason: ${rejectionReason}`
  );

  await sendEmail(
    rider.email,
    "Rider Application Rejected",
    `Your rider application has been rejected. Reason: ${rejectionReason}`
  );

  await auditLog({
    req,
    action: "RIDER_REJECTED",
    entity: {
      _id: rider._id,
      model: "Rider",
      label: rider.email
    },
    description: "Rider application rejected",
    metadata: {
      riderStatus: rider.status,
      reason: rejectionReason
    }
  });

  await rider.deleteOne();

  res.status(200).json(
    new ApiResponse(200, "Rider rejected successfully and removed from the system")
  );

});


// ================= SUSPEND RIDER =================
const suspendRider = asyncHandler(async (req, res) => {

  const riderId = assertValidObjectId(req.params.id, "riderId");
  const rider = await Rider.findById(riderId);
  const { durationDays, reason } = req.body;

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  const parsedDuration = durationDays === undefined ? null : Number(durationDays);

  if (durationDays !== undefined && (!Number.isInteger(parsedDuration) || parsedDuration <= 0)) {
    throw new ApiError(400, "durationDays must be a positive integer");
  }

  rider.status = "suspended";
  rider.rejectionReason = "";
  rider.suspensionReason = reason?.trim() || "";
  rider.suspendedAt = new Date();
  rider.suspendedUntil = parsedDuration
    ? new Date(Date.now() + parsedDuration * 24 * 60 * 60 * 1000)
    : null;

  await rider.save();

  await sendEmail(
    rider.email,
    "Rider Account Suspended",
    `Your rider account has been suspended.${rider.suspensionReason ? ` Reason: ${rider.suspensionReason}.` : ""}${rider.suspendedUntil ? ` Suspension ends on ${rider.suspendedUntil.toISOString()}.` : " Please contact support or wait for admin activation."}`
  );

  await auditLog({
    req,
    action: "RIDER_SUSPENDED",
    entity: {
      _id: rider._id,
      model: "Rider",
      label: rider.email
    },
    description: "Rider account suspended",
    metadata: {
      reason: rider.suspensionReason,
      suspendedUntil: rider.suspendedUntil,
      durationDays: parsedDuration
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Rider suspended successfully", rider)
  );

});

// ================= ACTIVATE RIDER =================
const activateRider = asyncHandler(async (req, res) => {

  const riderId = assertValidObjectId(req.params.id, "riderId");
  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await rider.refreshSuspensionStatus();

  if (rider.status !== "suspended") {
    throw new ApiError(400, "Only suspended riders can be activated");
  }

  rider.status = "approved";
  rider.rejectionReason = "";
  rider.suspensionReason = "";
  rider.suspendedAt = null;
  rider.suspendedUntil = null;

  await rider.save();
  // 🔔 Notification
  await createNotification(
    rider._id,
    "rider",
    "Account Activated",
    "Your rider account has been activated. You can login now."
  );
  await sendEmail(
    rider.email,
    "Rider Account Activated",
    "Your account is activated. Now you can login with your credentials."
  );

  await auditLog({
    req,
    action: "RIDER_ACTIVATED",
    entity: {
      _id: rider._id,
      model: "Rider",
      label: rider.email
    },
    description: "Rider account activated",
    metadata: {
      riderStatus: rider.status
    }
  });

  res.status(200).json(
    new ApiResponse(200, "Rider activated successfully", rider)
  );

});

// ================= DELETE RIDER =================
const deleteRider = asyncHandler(async (req, res) => {

  const riderId = assertValidObjectId(req.params.id, "riderId");
  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  await rider.refreshSuspensionStatus();

  if (!["approved", "suspended"].includes(rider.status)) {
    throw new ApiError(400, "Only approved or suspended rider accounts can be deleted");
  }
// 🔔 Notification
    await createNotification(
    rider._id,
    "rider",
    "Account Deleted",
    "Your rider account has been deleted by admin"
  );
  await sendEmail(
    rider.email,
    "Rider Account Deleted",
    "You are no longer able to access your account. Your account has been deleted from our application. For any query, please contact our support team."
  );

  await auditLog({
    req,
    action: "RIDER_DELETED",
    entity: {
      _id: rider._id,
      model: "Rider",
      label: rider.email
    },
    description: "Rider account deleted",
    metadata: {
      riderStatus: rider.status
    }
  });

  await rider.deleteOne();

  res.status(200).json(
    new ApiResponse(200, "Rider deleted successfully")
  );

});


// ================= 10.1 ADMIN DASHBOARD STATS =================
const getDashboardStats = asyncHandler(async (req, res) => {

  const [totalUsers, totalRestaurants, totalRiders, totalOrders, revenueSummary] =
    await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Rider.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            status: "DELIVERED"
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $multiply: [
                  {
                    $max: [
                      {
                        $subtract: [
                          { $ifNull: ["$pricing.grandTotal", 0] },
                          { $ifNull: ["$pricing.deliveryFee", 0] }
                        ]
                      },
                      0
                    ]
                  },
                  0.30
                ]
              }
            }
          }
        }
      ])
    ]);

  const totalRevenue = revenueSummary[0]?.totalRevenue || 0;

  res.status(200).json(
    new ApiResponse(200, "Dashboard stats fetched", {
      totalUsers,
      totalRestaurants,
      totalRiders,
      totalOrders,
      totalRevenue
    })
  );

});



// ================= 10.2 ADMIN REVENUE CHART =================
const getRevenueChart = asyncHandler(async (req, res) => {

  const period = String(req.query.period || "daily").trim().toLowerCase();

  if (!validChartPeriods.includes(period)) {
    throw new ApiError(400, "period must be one of: daily, weekly, monthly");
  }

  let groupFormat;

  if (period === "monthly") groupFormat = "%Y-%m";
  else if (period === "weekly") groupFormat = "%Y-%U";
  else groupFormat = "%Y-%m-%d";

  const revenue = await Order.aggregate([
    { $match: { status: "DELIVERED" } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        totalRevenue: {
          $sum: {
            $multiply: [
              {
                $max: [
                  {
                    $subtract: [
                      { $ifNull: ["$pricing.grandTotal", 0] },
                      { $ifNull: ["$pricing.deliveryFee", 0] }
                    ]
                  },
                  0
                ]
              },
              0.30
            ]
          }
        }
        ,
        deliveredOrders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, "Revenue analytics fetched", revenue)
  );

});

// ================= 10.3 ADMIN POPULAR ITEMS =================
const getPopularItems = asyncHandler(async (req, res) => {

  const parsedLimit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    throw new ApiError(400, "limit must be a positive integer");
  }

  const popularItems = await Order.aggregate([
    { $match: { status: "DELIVERED" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItem",
        itemName: { $first: "$items.name" },
        totalOrderedQuantity: { $sum: { $ifNull: ["$items.quantity", 0] } },
        totalRevenue: { $sum: { $ifNull: ["$items.total", 0] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalOrderedQuantity: -1, totalRevenue: -1 } },
    { $limit: parsedLimit },
    {
      $project: {
        _id: 1,
        itemName: 1,
        totalOrderedQuantity: 1,
        totalRevenue: 1,
        orderCount: 1
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, "Popular items analytics fetched", popularItems)
  );

});

const getMonthWindowStart = (monthsBack) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1, 0, 0, 0, 0));
};

const computeMonthRetention = (monthlyRows) => {
  const trend = [];

  for (let index = 0; index < monthlyRows.length; index += 1) {
    const current = monthlyRows[index];
    const previous = monthlyRows[index - 1];

    const currentUsers = new Set((current.userIds || []).map((id) => String(id)));
    const previousUsers = new Set((previous?.userIds || []).map((id) => String(id)));

    const retainedFromPrevious = [...currentUsers].filter((userId) => previousUsers.has(userId)).length;
    const retentionRateFromPrevious = previousUsers.size
      ? Number(((retainedFromPrevious / previousUsers.size) * 100).toFixed(2))
      : null;

    trend.push({
      month: current._id,
      activeUsers: currentUsers.size,
      retainedFromPrevious,
      retentionRateFromPrevious
    });
  }

  return trend;
};

// ================= 10.4 ADMIN USER RETENTION METRICS =================
const getUserRetentionMetrics = asyncHandler(async (req, res) => {
  const windowDays = req.query.windowDays === undefined ? 30 : Number(req.query.windowDays);

  if (!Number.isInteger(windowDays) || !validRetentionWindows.includes(windowDays)) {
    throw new ApiError(400, "windowDays must be one of: 7, 30, 90, 180");
  }

  const now = new Date();
  const activeSince = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    deliveredUserIds,
    activeUserIds,
    repeatUserRows,
    lastDeliveredRows,
    monthlyActiveRows,
  ] = await Promise.all([
    User.countDocuments(),
    Order.distinct("user", { status: "DELIVERED" }),
    Order.distinct("user", { status: "DELIVERED", createdAt: { $gte: activeSince } }),
    Order.aggregate([
      { $match: { status: "DELIVERED" } },
      { $group: { _id: "$user", ordersCount: { $sum: 1 } } },
      { $match: { ordersCount: { $gte: 2 } } },
      { $project: { _id: 1 } }
    ]),
    Order.aggregate([
      { $match: { status: "DELIVERED" } },
      { $group: { _id: "$user", lastDeliveredAt: { $max: "$createdAt" } } }
    ]),
    Order.aggregate([
      {
        $match: {
          status: "DELIVERED",
          createdAt: { $gte: getMonthWindowStart(6) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          userIds: { $addToSet: "$user" }
        }
      },
      { $sort: { _id: 1 } }
    ]),
  ]);

  const deliveredUserSet = new Set(deliveredUserIds.map((id) => String(id)));
  const activeUserSet = new Set(activeUserIds.map((id) => String(id)));
  const repeatUserSet = new Set(repeatUserRows.map((row) => String(row._id)));

  const returningUsersInWindow = [...activeUserSet].filter((userId) => repeatUserSet.has(userId)).length;
  const usersWithDeliveredOrders = deliveredUserSet.size;
  const activeUsersInWindow = activeUserSet.size;

  const repeatPurchaseRate = usersWithDeliveredOrders
    ? Number(((repeatUserSet.size / usersWithDeliveredOrders) * 100).toFixed(2))
    : 0;

  const retentionRate = totalUsers
    ? Number(((activeUsersInWindow / totalUsers) * 100).toFixed(2))
    : 0;

  const atRiskCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const atRiskUsers = lastDeliveredRows.filter((row) => row.lastDeliveredAt < atRiskCutoff).length;

  const newUsersInWindow = await User.countDocuments({ createdAt: { $gte: activeSince } });

  const retentionTrend = computeMonthRetention(monthlyActiveRows);

  res.status(200).json(
    new ApiResponse(200, "User retention analytics fetched", {
      windowDays,
      generatedAt: now.toISOString(),
      summary: {
        totalUsers,
        newUsersInWindow,
        usersWithDeliveredOrders,
        activeUsersInWindow,
        returningUsersInWindow,
        atRiskUsers,
        retentionRate,
        repeatPurchaseRate,
      },
      monthlyRetentionTrend: retentionTrend,
    })
  );
});



// ================= 10.5 RECENT ORDERS =================
const getRecentOrders = asyncHandler(async (req, res) => {

  const parsedLimit = Number(req.query.limit || 10);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    throw new ApiError(400, "limit must be a positive integer");
  }

  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .populate("user", "name email phone")
    .populate("restaurant", "name")
    .populate("rider", "name");

  res.status(200).json(
    new ApiResponse(200, "Recent orders fetched", orders)
  );

});



// ================= 10.6 TOP RESTAURANTS =================
const getTopRestaurants = asyncHandler(async (req, res) => {

  const { limit = 5, sortBy = "revenue" } = req.query;
  const normalizedSortBy = String(sortBy).trim().toLowerCase();
  const parsedLimit = Number(limit);

  if (!["revenue", "orders"].includes(normalizedSortBy)) {
    throw new ApiError(400, "sortBy must be either revenue or orders");
  }

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    throw new ApiError(400, "limit must be a positive integer");
  }

  const sortStage =
    normalizedSortBy === "orders"
      ? { totalOrders: -1, totalRevenue: -1 }
      : { totalRevenue: -1, totalOrders: -1 };

  const restaurants = await Restaurant.aggregate([
    {
      $lookup: {
        from: "orders",
        let: { restaurantId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$restaurant", "$$restaurantId"] },
              status: "DELIVERED"
            }
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: {
                $sum: { $ifNull: ["$pricing.grandTotal", 0] }
              }
            }
          }
        ],
        as: "orderStats"
      }
    },
    {
      $addFields: {
        totalOrders: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.totalOrders", 0] }, 0]
        },
        totalRevenue: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.totalRevenue", 0] }, 0]
        }
      }
    },
    { $sort: sortStage },
    { $limit: parsedLimit },
    {
      $project: {
        _id: 1,
        totalOrders: 1,
        totalRevenue: 1,
        restaurant: {
          _id: "$_id",
          name: "$name"
        }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, "Top restaurants fetched", restaurants)
  );

});



// ================= 10.7 LIST USERS =================
const listUsers = asyncHandler(async (req, res) => {

  const { page = 1, limit = 20, search } = req.query;

  const query = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Users fetched", {
      total,
      page,
      users
    })
  );

});



// ================= 10.8 BLOCK / UNBLOCK USER =================
const blockUser = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const userId = assertValidObjectId(id, "userId");

  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "User not found");

  if (user.isBlocked) {
    throw new ApiError(400, "User is already blocked");
  }

  user.isBlocked = true;

  await user.save();
  await sendEmail(
    user.email,
    "Account Blocked",
    "Your account is blocked for some suspicious activities. For some days we will review your account and get your account back soon."
  );

  await auditLog({
    req,
    action: "USER_BLOCKED",
    entity: {
      _id: user._id,
      model: "User",
      label: user.email
    },
    description: "User account blocked",
    metadata: {
      isBlocked: user.isBlocked
    }
  });

  res.status(200).json(
    new ApiResponse(200, "User blocked successfully", {
      isBlocked: user.isBlocked
    })
  );

});

// ================= 10.9 UNBLOCK USER =================
const unblockUser = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const userId = assertValidObjectId(id, "userId");

  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "User not found");

  if (!user.isBlocked) {
    throw new ApiError(400, "User is already unblocked");
  }

  user.isBlocked = false;

  await user.save();
  await sendEmail(
    user.email,
    "Account Unblocked",
    "Your account is unblocked. Now you can use your account."
  );

  await auditLog({
    req,
    action: "USER_UNBLOCKED",
    entity: {
      _id: user._id,
      model: "User",
      label: user.email
    },
    description: "User account unblocked",
    metadata: {
      isBlocked: user.isBlocked
    }
  });

  res.status(200).json(
    new ApiResponse(200, "User unblocked successfully", {
      isBlocked: user.isBlocked
    })
  );

});

// ================= ADMIN UNIFIED ANALYTICS =================
const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const analyticsRequest = parseAnalyticsRequest(req.query);
  const payload = await getSectionPayload(analyticsRequest);

  if (analyticsRequest.format === "pdf") {
    return writeAnalyticsPdfExport(res, payload, analyticsRequest.section);
  }

  if (analyticsRequest.format === "excel") {
    return writeAnalyticsExcelExport(res, payload, analyticsRequest.section);
  }

  res.status(200).json(
    new ApiResponse(200, "Platform analytics fetched", payload)
  );
});



module.exports = { 
  seedAdmin,
  login, 
  logout, 
  getProfile, 
  updateProfile ,


  getAllRiders,
  getSingleRider,
  approveRider,
  rejectRider,
  suspendRider,
  activateRider,
  deleteRider,

  getDashboardStats,
  getRevenueChart,
  getPopularItems,
  getUserRetentionMetrics,
  getRecentOrders,
  getTopRestaurants,
  getPlatformAnalytics,

  listUsers,
  blockUser,
  unblockUser
};
