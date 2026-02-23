import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Admin } from "../entities/Admin.entity";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";

const adminRepository = AppDataSource.getRepository(Admin);

export const AuthController = {

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        sendError(res, "Email and password are required", 400);
        return;
      }

      const admin = await adminRepository.findOne({ where: { email } });
      if (!admin) {
        sendError(res, "Invalid credentials", 401);
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      if (!isPasswordValid) {
        sendError(res, "Invalid credentials", 401);
        return;
      }

      // Fix — define options separately with correct type
      const signOptions: SignOptions = {
        expiresIn: "8h",
      };

      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        env.JWT_SECRET,
        signOptions
      );

      logger.info("Admin logged in", { adminId: admin.id });

      sendSuccess(
        res,
        {
          token,
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
          },
        },
        "Login successful"
      );
    } catch (error) {
      logger.error("Login failed", { error });
      sendError(res, "Login failed", 500);
    }
  },

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        sendError(res, "Email, password and name are required", 400);
        return;
      }

      const existing = await adminRepository.findOne({ where: { email } });
      if (existing) {
        sendError(res, "Admin with this email already exists", 409);
        return;
      }

      const password_hash = await bcrypt.hash(password, 12);

      const admin = adminRepository.create({ email, password_hash, name });
      await adminRepository.save(admin);

      logger.info("Admin registered", { adminId: admin.id });

      sendSuccess(
        res,
        { id: admin.id, email: admin.email, name: admin.name },
        "Admin registered successfully",
        201
      );
    } catch (error) {
      logger.error("Registration failed", { error });
      sendError(res, "Registration failed", 500);
    }
  },
};