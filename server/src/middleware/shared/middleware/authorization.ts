import { Request, Response, NextFunction } from 'express';

enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

interface PermissionConfig {
  [key: string]: UserRole[];
}

class AuthorizationMiddleware {
  private static ROLE_HIERARCHY: UserRole[] = [
    UserRole.GUEST,
    UserRole.USER,
    UserRole.MODERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ];

  private static ROUTE_PERMISSIONS: PermissionConfig = {
    '/api/users': [UserRole.USER, UserRole.ADMIN],
    '/api/admin': [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    '/api/moderation': [UserRole.MODERATOR, UserRole.ADMIN],
  };

  // Role-based access control
  static checkPermission(requiredRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = (req.user as any)?.role;

      if (!userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hasPermission = requiredRoles.some(role => 
        this.ROLE_HIERARCHY.indexOf(userRole) >= this.ROLE_HIERARCHY.indexOf(role)
      );

      if (hasPermission) {
        next();
      } else {
        res.status(403).json({ error: 'Insufficient permissions' });
      }
    };
  }

  // Dynamic route-based authorization
  static dynamicAuthorization(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    const userRole = (req.user as any)?.role;

    const allowedRoles = Object.entries(this.ROUTE_PERMISSIONS)
      .find(([routePattern]) => 
        new RegExp(routePattern).test(path)
      )?.[1];

    if (!allowedRoles) {
      return next(); // No specific permissions defined
    }

    const hasPermission = allowedRoles.some(role => 
      this.ROLE_HIERARCHY.indexOf(userRole) >= this.ROLE_HIERARCHY.indexOf(role)
    );

    if (hasPermission) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  }
}

export default AuthorizationMiddleware;