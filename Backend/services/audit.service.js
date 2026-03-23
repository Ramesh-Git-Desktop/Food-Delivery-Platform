const AuditLog = require("../models/AuditLog");

const ROLE_TO_MODEL = {
  "main-admin": "Admin",
  "restaurant-admin": "RestaurantAdmin",
  rider: "Rider",
  user: "User",
};

const SENSITIVE_KEYS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "otp",
  "resetPasswordToken",
  "emailVerificationToken",
  "authorization",
  "cookie",
];

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (!isObject(value)) {
    return value;
  }

  return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
    if (SENSITIVE_KEYS.includes(key)) {
      accumulator[key] = "[REDACTED]";
      return accumulator;
    }

    accumulator[key] = sanitizeValue(nestedValue);
    return accumulator;
  }, {});
};

const getRequestContext = (req) => ({
  method: req?.method || "",
  path: req?.originalUrl || req?.url || "",
  ip: req?.ip || req?.socket?.remoteAddress || "",
  userAgent: req?.get?.("user-agent") || "",
});

const getActorContext = (req) => ({
  actorId: req?.user?._id || req?.user?.id || null,
  actorRole: req?.user?.role || "system",
  actorModel: ROLE_TO_MODEL[req?.user?.role] || null,
});

const buildAuditMetadata = (metadata = {}) => sanitizeValue(metadata);

const createAuditLog = async ({
  req,
  action,
  entity,
  status = "SUCCESS",
  description = "",
  metadata = {},
}) => {
  const actor = getActorContext(req);

  return AuditLog.create({
    action,
    ...actor,
    entityId: entity?.id || entity?._id || null,
    entityModel: entity?.model || null,
    entityLabel: entity?.label || "",
    status,
    description,
    metadata: buildAuditMetadata(metadata),
    request: getRequestContext(req),
  });
};

const auditLog = async (details) => {
  try {
    return await createAuditLog(details);
  } catch (error) {
    console.error("Audit log error:", error.message);
    return null;
  }
};

module.exports = {
  auditLog,
  buildAuditMetadata,
};
