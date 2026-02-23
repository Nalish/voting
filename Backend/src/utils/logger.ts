import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, colorize, printf, json } = winston.format;

// Custom format for development — easy to read in terminal
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  return log;
});

export const logger = winston.createLogger({
  level: env.nodeEnv === "development" ? "debug" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    env.nodeEnv === "development"
      ? combine(colorize(), devFormat)  // colorful in dev
      : json()                          // plain JSON in production
  ),
  transports: [
    // Always log to console
    new winston.transports.Console(),

    // Log errors to a file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // Log everything to a file
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});