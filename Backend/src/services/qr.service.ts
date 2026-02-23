import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../config/database";
import { Session, SessionStatus } from "../entities/Session.entity";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { InternalError } from "../utils/errors";

const sessionRepository = AppDataSource.getRepository(Session);

export const QRService = {

  // Generate a new QR code and session
  async generateQRCode(): Promise<{ sessionId: string; qrCodeImage: string }> {
    try {
      // Create a unique token for this session
      const qrToken = uuidv4();

      // Set expiry time (5 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + env.QR_EXPIRY_MINUTES);

      // Save session to database
      const session = sessionRepository.create({
        qr_token: qrToken,
        status: SessionStatus.PENDING,
        expires_at: expiresAt,
      });
      await sessionRepository.save(session);

      // Generate QR code as base64 image
      // This URL is what the phone opens when scanned
      const votingUrl = `${process.env.FRONTEND_URL}/vote/mobile?session=${session.id}`;
      const qrCodeImage = await QRCode.toDataURL(votingUrl);

      logger.info("QR code generated", { sessionId: session.id });

      return {
        sessionId: session.id,
        qrCodeImage,
      };
    } catch (error) {
      logger.error("Failed to generate QR code", { error });
      throw new InternalError("Failed to generate QR code");
    }
  },

  // Check if a session is valid
  async validateSession(sessionId: string): Promise<Session> {
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.expires_at < new Date()) {
      // Mark as expired
      session.status = SessionStatus.EXPIRED;
      await sessionRepository.save(session);
      throw new Error("QR code has expired. Please refresh and try again");
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new Error("This session has already been used");
    }

    return session;
  },

  // Update session status
  async updateStatus(sessionId: string, status: SessionStatus): Promise<void> {
    await sessionRepository.update({ id: sessionId }, { status });
    logger.info("Session status updated", { sessionId, status });
  },
};