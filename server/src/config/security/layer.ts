import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

class MultiLayeredSecurity {
  // Comprehensive CORS configuration
  static corsConfig = cors({
    origin: (origin, callback) => {
      const whitelist = [
        "https://yourmaindomain.com",
        /\.yourmaindomain\.com$/,
      ];

      if (
        !origin ||
        whitelist.some((domain) =>
          domain instanceof RegExp ? domain.test(origin) : domain === origin
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  });

  // Advanced rate limiting
  static createRateLimiter(options?: { windowMs?: number; max?: number }) {
    return rateLimit({
      windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes
      max: options?.max || 100, // Limit each IP to 100 requests per window
      message: "Too many requests, please try again later",
      headers: true,
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // Security headers middleware
  static securityHeaders = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  // Input sanitization middleware
  static sanitizeInput(req: Request, res: Response, next: NextFunction) {
    const sanitize = (input: any): any => {
      if (typeof input === "string") {
        // Remove potential XSS characters
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .trim();
      }

      if (typeof input === "object" && input !== null) {
        return Object.keys(input).reduce((acc, key) => {
          acc[key] = sanitize(input[key]);
          return acc;
        }, {} as any);
      }

      return input;
    };

    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);

    next();
  }

  // Advanced request validation middleware
  static validateRequest(
    schema: any,
    source: "body" | "query" | "params" = "body"
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedData = schema.parse(req[source]);
        req[source] = validatedData;
        next();
      } catch (error) {
        res.status(400).json({
          error: "Invalid request",
          details: error,
        });
      }
    };
  }

  // Advanced threat detection middleware
  static async threatDetectionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Check IP reputation
      const ipReputation = await SecurityHardener.checkIPReputation(
        req.ip || req.connection.remoteAddress
      );

      if (ipReputation.isThreat || ipReputation.reputation < 0.5) {
        return res.status(403).json({
          error: "Access denied",
          reason: "Potential security threat",
        });
      }

      next();
    } catch (error) {
      // Fail-safe approach
      next();
    }
  }
}

export default MultiLayeredSecurity;
