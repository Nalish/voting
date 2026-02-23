import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { logger } from "../utils/logger";

let io: SocketServer;

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.debug("New WebSocket connection", { socketId: socket.id });

    // Laptop joins a room using its sessionId
    // This is called immediately when the laptop shows the QR code
    socket.on("join:session", (sessionId: string) => {
      socket.join(sessionId);
      logger.debug("Socket joined session room", {
        socketId: socket.id,
        sessionId,
      });

      // Confirm to laptop that it is listening
      socket.emit("session:joined", { sessionId });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.debug("Socket disconnected", { socketId: socket.id });
    });
  });

  return io;
};

// ─── Emit Functions ───────────────────────────────────────────────
// These are called from your services to notify the laptop

// Called when phone opens the QR link
export const emitSessionScanned = (sessionId: string): void => {
  if (!io) return;
  io.to(sessionId).emit("session:scanned", {
    message: "Phone connected. Please scan your fingerprint.",
  });
  logger.debug("Emitted session:scanned", { sessionId });
};

// Called when fingerprint verified successfully
export const emitBiometricVerified = (
  sessionId: string,
  biometricId: string
): void => {
  if (!io) return;
  io.to(sessionId).emit("biometric:verified", {
    biometricId,
    message: "Fingerprint verified. You may now cast your vote.",
  });
  logger.debug("Emitted biometric:verified", { sessionId, biometricId });
};

// Called when vote is cast successfully
export const emitVoteCast = (sessionId: string): void => {
  if (!io) return;
  io.to(sessionId).emit("vote:cast", {
    message: "Your vote has been cast successfully.",
  });
  logger.debug("Emitted vote:cast", { sessionId });
};

// Called when session expires
export const emitSessionExpired = (sessionId: string): void => {
  if (!io) return;
  io.to(sessionId).emit("session:expired", {
    message: "QR code has expired. Please refresh the page.",
  });
  logger.debug("Emitted session:expired", { sessionId });
};