import { Request, Response, NextFunction } from "express";
import AuthService from "../services/authService";
import asyncHandler from "../utils/asyncHandler";

class AuthController {
  // User Registration
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    const user = await AuthService.register({
      email,
      username,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  });

  // User Login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get("User-Agent") || "";

    const result = await AuthService.login({ email, password }, ip, userAgent);

    res.json(result);
  });

  // Refresh Token
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshToken(refreshToken);

    res.json(result);
  });

  // Logout
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const ip = req.ip;
    const userAgent = req.get("User-Agent") || "";

    const result = await AuthService.logout(userId, ip, userAgent);

    res.json(result);
  });

  // Forgot Password
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Implement password reset logic
    await AuthService.initiatePasswordReset(email);

    res.json({
      message: "Password reset instructions sent to your email",
    });
  });

  // Reset Password
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await AuthService.resetPassword(token, newPassword);

    res.json({
      message: "Password reset successfully",
    });
  });
}

export default new AuthController();
