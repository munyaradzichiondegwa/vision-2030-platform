import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

class SecurityMiddleware {
  // Comprehensive CORS configuration
  static corsConfig = cors({
    origin: (origin, callback) => {
      const whitelist = [
        'https://yourmaindomain.com',
        /\.yourmaindomain\.com$/
      ];

      if (!origin || whitelist.some(domain => 
        domain instanceof RegExp 
          ? domain.test(origin) 
          : domain === origin
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With'
    ],
    credentials: true
  });

  // Comprehensive rate limiting
  static rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests, please try again later',
    headers: true
  });

  // Security headers middleware
  static securityHeaders = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  });

  // Request sanitization middleware
  static sanitizeRequest(req: Request, res: Response, next: NextFunction) {
    // Trim and sanitize input
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });

    // Remove potential XSS characters
    const xssSanitize = (input: string) => 
      input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    next();
  }
}

export default SecurityMiddleware;