import "reflect-metadata";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import { AppDataSource } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { globalErrorHandler } from "./utils/response";
import { initializeSocket } from "./websocket/socket";
import routes from "./routes/index";

const app = express();

// Create HTTP server — needed for WebSocket
const httpServer = createServer(app);

// Initialize WebSocket on the same server
initializeSocket(httpServer);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Global error handler — must be last
app.use(globalErrorHandler);

// Start server
AppDataSource.initialize()
  .then(() => {
    logger.info("✅ Database connected successfully");
    app.listen(env.port, () => {
      logger.info(`🚀 Server running on port ${env.port}`);
    });
  })
  .catch((error) => {
    logger.error("❌ Database connection failed", { error });
    process.exit(1);
  });
