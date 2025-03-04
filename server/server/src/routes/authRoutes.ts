// server/src/routes/authRoutes.ts
import express from "express";
import { register, login } from "../controllers/authController";
import { rateLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.post("/register", rateLimiter, register);
router.post("/login", rateLimiter, login);

export default router;
