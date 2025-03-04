// server/src/config/environment.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = process.env;

export default {
  PORT: env.PORT || 5000,
  NODE_ENV: env.NODE_ENV || "development",
  DATABASE_URL: env.DATABASE_URL || "mongodb://localhost:27017/vision2030",
  JWT_SECRET: env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || "1h",
  RATE_LIMIT_WINDOW_MS: parseInt(env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
};
