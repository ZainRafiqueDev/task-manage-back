import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = "logs";

// Ensure logs directory exists
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const { combine, timestamp, errors, printf, colorize, json } = winston.format;

// Console format
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// File format (readable plain text)
const fileFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp(),
    errors({ stack: true }) // Log error stack
  ),
  defaultMeta: { service: "task-management-api" },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: combine(timestamp(), errors({ stack: true }), fileFormat),
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: combine(timestamp(), errors({ stack: true }), fileFormat),
    }),
  ],
});

// Console logging for non-production
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), consoleFormat),
    })
  );
}
