import User from "../models/User";
import Token from "../models/Token";
import AuditLog from "../models/AuditLog";
import { UserRole, UserDTO } from "../types/user";
import { TokenType } from "../models/Token";
import { CustomError } from "../middleware/errorHandler";
import EncryptionUtil from "../utils/encryption";
import jwt from "jsonwebtoken";
import environmentConfig from "../config/environment";

interface AuthCredentials {
  email: string;
  password: string;
}

interface RegisterInput extends AuthCredentials {
  username: string;
}

class AuthService {
  // Generate Access Token
  private generateAccessToken(user: UserDTO): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      environmentConfig.JWT_SECRET,
      { expiresIn: "15m" }
    );
  }

  // Generate Refresh Token
  private async generateRefreshToken(userId: string): Promise<string> {
    const token = EncryptionUtil.generateRandomToken();

    await Token.create({
      user: userId,
      token,
      type: TokenType.REFRESH,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return token;
  }

  // User Registration
  async register(input: RegisterInput): Promise<UserDTO> {
    const { email, username, password } = input;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new CustomError("User already exists", 409);
    }

    // Create new user
    const user = new User({
      email,
      username,
      password,
      role: UserRole.USER,
    });

    await user.save();

    return this.sanitizeUser(user);
  }

  // User Login
  async login(credentials: AuthCredentials, ip: string, userAgent: string) {
    const { email, password } = credentials;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new CustomError("Invalid credentials", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new CustomError("Account is not active", 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create audit log
    await AuditLog.create({
      user: user._id,
      action: "LOGIN",
      ip,
      userAgent,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(this.sanitizeUser(user));
    const refreshToken = await this.generateRefreshToken(user._id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  // Refresh Access Token
  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const tokenDoc = await Token.findOne({
      token: refreshToken,
      type: TokenType.REFRESH,
    }).populate("user");

    if (!tokenDoc) {
      throw new CustomError("Invalid refresh token", 401);
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(
      this.sanitizeUser(tokenDoc.user)
    );

    return { accessToken };
  }

  // Logout
  async logout(userId: string, ip: string, userAgent: string) {
    // Delete refresh tokens
    await Token.deleteMany({
      user: userId,
      type: TokenType.REFRESH,
    });

    // Create logout audit log
    await AuditLog.create({
      user: userId,
      action: "LOGOUT",
      ip,
      userAgent,
    });

    return { message: "Logged out successfully" };
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

export default new AuthService();
