// server/src/config/security.ts
import helmet from 'helmet';
import express from 'express';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

export const secure = (app: express.Application) => {
  // Set security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    }
  }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Sanitize data
  app.use(mongoSanitize());
  
  // CSRF Protection
  app.use(csurf());
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next(err);
  });
};