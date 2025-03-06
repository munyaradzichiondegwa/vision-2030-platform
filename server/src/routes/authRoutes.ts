Let's create the routes and controllers for authentication and user management.

Authentication Routes
typescript
Copy
// server/src/routes/authRoutes.ts
import express from 'express';
import AuthController from '../controllers/authController';
import ValidationMiddleware from '../middleware/validation';
import AuthMiddleware from '../middleware/authentication';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post(
  '/register', 
  authLimiter,
  ValidationMiddleware.validate(ValidationMiddleware.schemas.user),
  AuthController.register
);

router.post(
  '/login', 
  authLimiter,
  ValidationMiddleware.validate(ValidationMiddleware.schemas.login),
  AuthController.login
);

router.post(
  '/refresh-token',
  AuthController.refreshToken
);

router.post(
  '/logout', 
  AuthMiddleware.authenticate,
  AuthController.logout
);

router.post(
  '/forgot-password',
  authLimiter,
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  AuthController.resetPassword
);

export default router;