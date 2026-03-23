const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");

const logsDirectory = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const loggerTransports = [new transports.Console()];

if (process.env.NODE_ENV === "production") {
  loggerTransports.push(
    new transports.File({
      filename: path.join(logsDirectory, "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(logsDirectory, "combined.log"),
    })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "food-order-api" },
  transports: loggerTransports,
});

module.exports = logger;
