import { Request, Response } from "express";
import UserService from "../services/userService";
import asyncHandler from "../utils/asyncHandler";
import { UserRole } from "../types/user";

class UserController {
  // Get User Profile
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const user = await UserService.getUserById(userId);

    res.json(user);
  });

  // Update User Profile
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const updateData = req.body;

    const updatedUser = await UserService.updateUser(
      userId,
      updateData,
      userId
    );

    res.json(updatedUser);
  });

  // List Users
  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, role, isActive } = req.query;

    const result = await UserService.listUsers(
      Number(page) || 1,
      Number(limit) || 10,
      {
        role: role as UserRole,
        isActive: isActive === "true" ? true : undefined,
      }
    );

    res.json(result);
  });

  // Change User Role
  changeUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { newRole } = req.body;
    const actorId = req.user!.userId;

    const updatedUser = await UserService.changeUserRole(
      userId,
      newRole,
      actorId
    );

    res.json(updatedUser);
  });
}

export default new UserController();
