import { Router } from "express";
import authRoutes from "./auth.routes";
import sessionRoutes from "./session.routes";
import biometricRoutes from "./biometric.routes";
import voteRoutes from "./vote.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/session", sessionRoutes);
router.use("/biometric", biometricRoutes);
router.use("/vote", voteRoutes);

export default router;