import { Router } from "express";
import { SessionController } from "../controllers/session.controller";
import { generalLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// QR flow — laptop has no fingerprint
router.post("/generate/qr", generalLimiter, SessionController.generateQR);

// Direct flow — laptop has fingerprint
router.post("/generate/direct", generalLimiter, SessionController.generateDirect);

// Shared routes
router.get("/:sessionId/status", generalLimiter, SessionController.getStatus);
router.post("/:sessionId/scan", generalLimiter, SessionController.markScanned);

export default router;
