const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const csrf = require("csurf");
const { connectDB, disconnectDB } = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const AuditLog = require("./models/AuditLog");
const swaggerUi = require("swagger-ui-express");
const { sanitizeRequestInputs } = require("./middlewares/sanitize.middleware");
const { responseFormatter } = require("./middlewares/response.middleware");
const Review = require("./models/Review");
const logger = require("./utils/logger");
const swaggerSpec = require("./swagger");

dotenv.config();

const app = express();
let server;
let isShuttingDown = false;

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequestInputs);
app.use(responseFormatter);
const isProduction = process.env.NODE_ENV === "production";
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  },
  value: (req) => {
    // Allow CSRF token to be supplied via cookie (XSRF-TOKEN),
    // while still supporting header/body/query if present.
    const headerToken =
      req.get("x-csrf-token") ||
      req.get("x-xsrf-token") ||
      req.get("xsrf-token");

    if (headerToken) {
      return headerToken;
    }

    if (req.body && req.body._csrf) {
      return req.body._csrf;
    }

    if (req.query && req.query._csrf) {
      return req.query._csrf;
    }

    return req.cookies && req.cookies["XSRF-TOKEN"];
  },
});
app.use(csrfProtection);

// Serve uploaded files as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const adminRoutes = require("./routes/admin.routes");
const restaurantAdminRoutes = require("./routes/restaurantAdmin.routes");
const menuRoutes = require("./routes/menu.routes");
const userRestaurantRoutes = require("./routes/userrestaurant.routes");
const cartRoutes = require("./routes/cart.routes");
const couponRoutes = require("./routes/coupon.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");
const orderRoutes = require("./routes/order.routes");
const restaurantOrderRoutes = require("./routes/resturantorder.routes");
const adminOrderRoutes = require("./routes/adminOrder.routes");
const riderRoutes = require("./routes/rider.routes");
const reviewRoutes = require("./routes/review.routes");
const healthRoutes = require("./routes/health");
const inventoryRoutes = require("./routes/inventory.routes");

app.use("/api/admin", adminRoutes);
app.use("/api/restaurant-admin", restaurantAdminRoutes);
app.use("/api/restaurant", menuRoutes);
app.use("/api/restaurants", userRestaurantRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/restaurant-admin/orders", restaurantOrderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/rider", riderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/", healthRoutes);
app.use("/api/inventory", inventoryRoutes);

app.get("/api/csrf-token", (req, res) => {
  const csrfToken = req.csrfToken();

  // Expose token via a readable cookie for clients that prefer it
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
  });

  res.status(200).json({ csrfToken });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Food-Order API is running",
    version: "1.0.0",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Starting graceful shutdown...`);

  const forceShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);

  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      console.log("HTTP server closed");
    }

    await disconnectDB();
    clearTimeout(forceShutdownTimer);
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    clearTimeout(forceShutdownTimer);
    process.exit(1);
  }
};

const registerShutdownHandlers = () => {
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      shutdown(signal);
    });
  });
};

const startServer = async () => {
  try {
    await connectDB();
    await AuditLog.syncIndexes();
    await Review.syncIndexes();

    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      logger.info("Server started", {
        port: PORT,
        url: `http://localhost:${PORT}`,
        nodeEnv: process.env.NODE_ENV || "development",
      });
    });

    registerShutdownHandlers();
  } catch (error) {
    console.error("Server startup failed:", error);

    try {
      await disconnectDB();
    } catch (disconnectError) {
      console.error("Failed to close DB after startup error:", disconnectError);
    }

    process.exit(1);
  }
};

startServer();
