import { Router } from "express";
import { VoteController } from "../controllers/vote.controller";
import { validate, voteSchema } from "../middleware/validate.middleware";
import { strictLimiter, generalLimiter } from "../middleware/rateLimit.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/cast",strictLimiter,validate(voteSchema),VoteController.cast);

// Admin only routes
router.get("/results", generalLimiter, authMiddleware, VoteController.getResults);
router.get("/count", generalLimiter, authMiddleware, VoteController.getCount);

export default router;
