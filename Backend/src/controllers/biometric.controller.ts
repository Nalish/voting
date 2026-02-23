import { Request, Response } from "express";
import { BiometricService } from "../services/biometric.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

export const BiometricController = {

  // POST /api/biometric/verify
  // Called when phone submits the fingerprint scan
  async verify(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, credentialId, publicKey, fingerprintHash } = req.body;

      // Validate input
      if (!sessionId || !credentialId || !publicKey || !fingerprintHash) {
        sendError(res, "Missing required biometric fields", 400);
        return;
      }

      const biometric = await BiometricService.verifyAndRegister(
        sessionId,
        credentialId,
        publicKey,
        fingerprintHash
      );

      logger.info("Biometric verified", { biometricId: biometric.id });

      sendSuccess(
        res,
        { biometricId: biometric.id },
        "Fingerprint verified successfully",
        201
      );
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error("Biometric verification failed", { error });
      sendError(res, "Biometric verification failed", 500);
    }
  },
};