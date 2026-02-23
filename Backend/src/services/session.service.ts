import { AppDataSource } from "../config/database";
import { Session, SessionStatus, FlowType } from "../entities/Session.entity";
import { NotFoundError, GoneError, ConflictError } from "../utils/errors";
import { logger } from "../utils/logger";
import { emitSessionScanned } from "../websocket/socket";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";

const sessionRepository = AppDataSource.getRepository(Session);

export const SessionService = {

  // Create session for QR flow (laptop has no fingerprint)
  async createQRSession(): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.QR_EXPIRY_MINUTES);

    const session = sessionRepository.create({
      qr_token: uuidv4(),
      status: SessionStatus.PENDING,
      expires_at: expiresAt,
      flow_type: FlowType.QR,        // ← use enum not string "qr"
    });

    await sessionRepository.save(session);
    logger.info("QR session created", { sessionId: session.id });
    return session;
  },

  // Create session for direct flow (laptop has fingerprint)
  async createDirectSession(): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.QR_EXPIRY_MINUTES);

    const session = sessionRepository.create({
      qr_token: uuidv4(),
      status: SessionStatus.PENDING,
      expires_at: expiresAt,
      flow_type: FlowType.DIRECT,    // ← use enum not string "direct"
    });

    await sessionRepository.save(session);
    logger.info("Direct session created", { sessionId: session.id });
    return session;
  },

  // Get a session by ID with full validation
  async getValidSession(sessionId: string): Promise<Session> {
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundError("Session not found");

    if (session.expires_at < new Date()) {
      session.status = SessionStatus.EXPIRED;
      await sessionRepository.save(session);
      throw new GoneError("Session has expired. Please refresh and try again");
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new ConflictError("This session has already been completed");
    }

    if (session.status === SessionStatus.EXPIRED) {
      throw new GoneError("This session has expired");
    }

    return session;
  },

  // Mark session as scanned (phone opened the link)
  async markAsScanned(sessionId: string): Promise<void> {
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundError("Session not found");

    session.status = SessionStatus.SCANNED;
    await sessionRepository.save(session);

    emitSessionScanned(sessionId);
    logger.info("Session marked as scanned", { sessionId });
  },

  // Mark session as completed (vote cast)
  async markAsCompleted(sessionId: string): Promise<void> {
    await sessionRepository.update(
      { id: sessionId },
      { status: SessionStatus.COMPLETED }
    );
    logger.info("Session marked as completed", { sessionId });
  },

  // Clean up expired sessions
  async expireOldSessions(): Promise<void> {
    const result = await sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({ status: SessionStatus.EXPIRED })
      .where("expires_at < :now", { now: new Date() })
      .andWhere("status = :status", { status: SessionStatus.PENDING })
      .execute();

    logger.info("Expired old sessions", { count: result.affected });
  },
};