import express from "express";
import UserController from "../controllers/userController";
import AuthMiddleware from "../middleware/authentication";
import { UserRole } from "../types/user";
import { apiLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.get(
  "/profile",
  apiLimiter,
  AuthMiddleware.authenticate,
  UserController.getProfile
);

router.put(
  "/profile",
  apiLimiter,
  AuthMiddleware.authenticate,
  UserController.updateProfile
);

router.get(
  "/",
  apiLimiter,
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize([UserRole.ADMIN, UserRole.MODERATOR]),
  UserController.listUsers
);

router.put(
  "/:userId/role",
  apiLimiter,
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize([UserRole.ADMIN]),
  UserController.changeUserRole
);

export default router;
