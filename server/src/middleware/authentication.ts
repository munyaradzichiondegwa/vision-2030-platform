import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import environmentConfig from "../config/environment";
import { UserRole } from "../types/user";

interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

class AuthenticationMiddleware {
  static authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        environmentConfig.JWT_SECRET
      ) as TokenPayload;

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  static authorize(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Insufficient permissions",
        });
      }

      next();
    };
  }
}

export default AuthenticationMiddleware;
