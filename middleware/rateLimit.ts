import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { Redis } from "ioredis";
import environmentConfig from "../config/environment";

class RateLimitMiddleware {
  private static redisClient: Redis;

  static initialize(client: Redis) {
    this.redisClient = client;
  }

  // General API rate limiter
  static apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict authentication rate limiter
  static authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts
    message: "Too many login attempts, please try again later",
    store: new RedisStore({
      sendCommand: (...args: string[]) => this.redisClient.call(...args),
      prefix: "rl:auth:",
    }),
  });

  // Brute force protection middleware
  static bruteForceProtection(maxAttempts = 5, blockDuration = 15 * 60) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip;
      const key = `bf:${ip}`;

      try {
        const attempts = await this.redisClient.incr(key);

        if (attempts === 1) {
          await this.redisClient.expire(key, blockDuration);
        }

        if (attempts > maxAttempts) {
          return res.status(429).json({
            message: "Too many failed attempts. Account temporarily blocked.",
            blockedUntil: new Date(Date.now() + blockDuration * 1000),
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export default RateLimitMiddleware;
