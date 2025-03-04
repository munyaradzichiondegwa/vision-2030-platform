// server/src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import environment from "../config/environment";

export const rateLimiter = rateLimit({
  windowMs: environment.RATE_LIMIT_WINDOW_MS,
  max: environment.RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests, please try again later.",
});
