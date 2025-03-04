// server/src/app.ts
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/database";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Error Handler
app.use(errorHandler);

// Database Connection
connectDB();

export default app;
