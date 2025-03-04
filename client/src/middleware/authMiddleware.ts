import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const checkPermissions = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};