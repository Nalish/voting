import { Request, Response } from "express";
import { QRService } from "../services/qr.service";
import { SessionService } from "../services/session.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

export const SessionController = {

  // POST /api/session/generate/qr
  // Called when laptop has NO fingerprint sensor
  async generateQR(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, qrCodeImage } = await QRService.generateQRCode();
      sendSuccess(
        res,
        { sessionId, qrCodeImage, flowType: "qr" },
        "QR code generated",
        201
      );
    } catch (error) {
      logger.error("Failed to generate QR session", { error });
      sendError(res, "Failed to generate QR code", 500);
    }
  },

  // POST /api/session/generate/direct
  // Called when laptop HAS a fingerprint sensor
  async generateDirect(req: Request, res: Response): Promise<void> {
    try {
      const session = await SessionService.createDirectSession();
      sendSuccess(
        res,
        { sessionId: session.id, flowType: "direct" },
        "Direct session created",
        201
      );
    } catch (error) {
      logger.error("Failed to generate direct session", { error });
      sendError(res, "Failed to create session", 500);
    }
  },

  // GET /api/session/:sessionId/status
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params["sessionId"] as string;

      if (!sessionId) {
        sendError(res, "Session ID is required", 400);
        return;
      }

      const session = await SessionService.getValidSession(sessionId);
      sendSuccess(
        res,
        {
          status: session.status,
          flowType: session.flow_type,
        },
        "Session status retrieved"
      );
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error("Failed to get session status", { error });
      sendError(res, "Failed to get session status", 500);
    }
  },

  // POST /api/session/:sessionId/scan
  async markScanned(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params["sessionId"] as string;

      if (!sessionId) {
        sendError(res, "Session ID is required", 400);
        return;
      }

      await SessionService.markAsScanned(sessionId);
      sendSuccess(res, null, "Session marked as scanned");
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error("Failed to mark session as scanned", { error });
      sendError(res, "Failed to update session", 500);
    }
  },
};