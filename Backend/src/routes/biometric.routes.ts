import { Router } from "express";
import { BiometricController } from "../controllers/biometric.controller";
import { validate, biometricSchema } from "../middleware/validate.middleware";
import { strictLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post(
  "/verify",
  strictLimiter,
  validate(biometricSchema),
  BiometricController.verify
);

export default router;