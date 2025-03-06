import User from "../models/User";
import { UserDTO, UserRole } from "../types/user";
import { CustomError } from "../middleware/errorHandler";
import AuditLog from "../models/AuditLog";

interface UpdateUserInput {
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  settings?: {
    theme?: "light" | "dark";
    language?: string;
    notifications?: boolean;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

class UserService {
  // Get User by ID
  async getUserById(userId: string): Promise<UserDTO> {
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return this.sanitizeUser(user);
  }

  // Update User Profile
  async updateUser(
    userId: string,
    input: UpdateUserInput,
    actorId: string
  ): Promise<UserDTO> {
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Update profile if provided
    if (input.profile) {
      user.profile = { ...user.profile, ...input.profile };
    }

    // Update settings if provided
    if (input.settings) {
      user.settings = { ...user.settings, ...input.settings };
    }

    // Update social links if provided
    if (input.socialLinks) {
      user.socialLinks = { ...user.socialLinks, ...input.socialLinks };
    }

    // Create audit log
    await AuditLog.create({
      user: userId,
      action: "USER_UPDATED",
      metadata: {
        updatedBy: actorId,
        changes: Object.keys(input),
      },
    });

    await user.save();

    return this.sanitizeUser(user);
  }

  // Change User Role (Admin only)
  async changeUserRole(
    targetUserId: string,
    newRole: UserRole,
    actorId: string
  ): Promise<UserDTO> {
    const user = await User.findById(targetUserId);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Prevent downgrading SUPER_ADMIN role
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new CustomError("Cannot modify SUPER_ADMIN role", 403);
    }

    // Create audit log
    await AuditLog.create({
      user: targetUserId,
      action: "ROLE_CHANGED",
      metadata: {
        oldRole: user.role,
        newRole,
        changedBy: actorId,
      },
    });

    user.role = newRole;
    await user.save();

    return this.sanitizeUser(user);
  }

  // List Users (with pagination and filters)
  async listUsers(
    page = 1,
    limit = 10,
    filters: {
      role?: UserRole;
      isActive?: boolean;
    } = {}
  ) {
    const query = filters ? { ...filters } : {};

    const users = await User.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("-password");

    const total = await User.countDocuments(query);

    return {
      users: users.map(this.sanitizeUser),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
      },
    };
  }

  // Sanitize user for safe transmission
  private sanitizeUser(user: any): UserDTO {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile || {},
      settings: user.settings || {},
      socialLinks: user.socialLinks,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }
}

export default new UserService();
