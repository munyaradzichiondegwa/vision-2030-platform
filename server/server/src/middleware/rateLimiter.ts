import rateLimit from "express-rate-limit";
import { Request } from "express";

const createRateLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs, // Time window in milliseconds
    max, // Limit each IP to X requests per window
    message: { message },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers

    // Custom key generator (optional)
    keyGenerator: (req: Request) => {
      // You can customize how the rate limit key is generated
      // For example, use user ID if authenticated
      return req.user?.userId || req.ip;
    },
  });

export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  "Too many login attempts, please try again later"
);

export const apiLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  1000, // 1000 requests per hour
  "Too many requests, please try again later"
);
