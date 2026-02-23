import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import multer from "multer"
import { loginLimiter } from "../middleware/rateLimit.middleware";
import { loginSchema,registerSchema,validate } from "../middleware/validate.middleware";


const router = Router();
const upload=multer()

router.post("/login",upload.none(),loginLimiter,validate(loginSchema), AuthController.login);
router.post("/register",upload.none(),validate(registerSchema), AuthController.register);

export default router;