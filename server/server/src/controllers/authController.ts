// server/src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User";
import environment from "../config/environment";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, environment.JWT_SECRET, {
      expiresIn: environment.JWT_EXPIRES_IN,
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: "Registration failed", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, environment.JWT_SECRET, {
      expiresIn: environment.JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
