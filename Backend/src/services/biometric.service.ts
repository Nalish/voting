import { AppDataSource } from "../config/database";
import { Biometric } from "../entities/Biometric.entity";
import { SessionService } from "./session.service";
import { ConflictError, InternalError } from "../utils/errors";
import { logger } from "../utils/logger";
import { emitBiometricVerified } from "../websocket/socket";

const biometricRepository = AppDataSource.getRepository(Biometric);

export const BiometricService = {

  // Core function — verify fingerprint and register if new
  async verifyAndRegister(
    sessionId: string,
    credentialId: string,
    publicKey: string,
    fingerprintHash: string
  ): Promise<Biometric> {

    // Step 1: Validate the session
    const session = await SessionService.getValidSession(sessionId);

    // Step 2: Check if this credential has been used before (same device/finger)
    const existingCredential = await biometricRepository.findOne({
      where: { credential_id: credentialId },
    });
    if (existingCredential) {
      logger.warn("Duplicate credential detected", { credentialId });
      throw new ConflictError("You have already voted");
    }

    // Step 3: Check if this fingerprint hash exists (different device, same finger)
    const existingHash = await biometricRepository.findOne({
      where: { fingerprint_hash: fingerprintHash },
    });
    if (existingHash) {
      logger.warn("Duplicate fingerprint hash detected", { fingerprintHash });
      throw new ConflictError("You have already voted");
    }

    // Step 4: All checks passed — save the biometric record
    try {
      const biometric = biometricRepository.create({
        credential_id: credentialId,
        public_key: publicKey,
        fingerprint_hash: fingerprintHash,
        session_id: session.id,
      });
      await biometricRepository.save(biometric);

      emitBiometricVerified(sessionId, biometric.id);

      // Step 5: Mark session as scanned
      await SessionService.markAsScanned(sessionId);

      logger.info("Biometric registered successfully", {
        biometricId: biometric.id,
        sessionId,
      });

      return biometric;
    } catch (error) {
      logger.error("Failed to save biometric", { error });
      throw new InternalError("Failed to register biometric");
    }
  },

  // Find a biometric record by ID
  async findById(id: string): Promise<Biometric | null> {
    return biometricRepository.findOne({ where: { id } });
  },
};