// server/src/middleware/authentication.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import environment from "../config/environment";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, environment.JWT_SECRET) as {
      userId: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};
