const { body, param, query } = require("express-validator");

const SENSITIVE_FIELD_PATTERN = /(password|token|otp|pin|secret|apiKey|api_key)/i;

const sanitizeString = (value) => {
  if (typeof value !== "string") return value;

  let sanitized = value.trim();

  // Remove script tags and inline javascript: payloads commonly used for XSS.
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized;
};

const deepSanitize = (value, path = "") => {
  if (typeof value === "string") {
    if (SENSITIVE_FIELD_PATTERN.test(path)) return value;
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => deepSanitize(item, `${path}[${index}]`));
  }

  if (value && typeof value === "object") {
    const sanitizedObject = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      const nestedPath = path ? `${path}.${key}` : key;
      sanitizedObject[key] = deepSanitize(nestedValue, nestedPath);
    }

    return sanitizedObject;
  }

  return value;
};

const sanitizeRequestInputs = async (req, res, next) => {
  try {
    await Promise.all([
      body().customSanitizer((value) => deepSanitize(value)).run(req),
      query().customSanitizer((value) => deepSanitize(value)).run(req),
      param().customSanitizer((value) => deepSanitize(value)).run(req),
    ]);

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { sanitizeRequestInputs };
