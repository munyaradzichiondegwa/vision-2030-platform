import { UserRole } from '../services/authService';

class RBAC {
  static canAccess(
    userRole: UserRole, 
    requiredRole: UserRole
  ): boolean {
    const roleHierarchy = {
      [UserRole.GUEST]: 1,
      [UserRole.USER]: 2,
      [UserRole.ADMIN]: 3,
      [UserRole.SUPER_ADMIN]: 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  static getAccessibleRoutes(role: UserRole): string[] {
    const routeMap = {
      [UserRole.GUEST]: ['/login', '/register', '/public'],
      [UserRole.USER]: [
        ...this.getAccessibleRoutes(UserRole.GUEST),
        '/dashboard',
        '/profile'
      ],
      [UserRole.ADMIN]: [
        ...this.getAccessibleRoutes(UserRole.USER),
        '/admin',
        '/management'
      ],
      [UserRole.SUPER_ADMIN]: [
        ...this.getAccessibleRoutes(UserRole.ADMIN),
        '/system-config',
        '/user-management'
      ]
    };

    return routeMap[role];
  }
}

export default RBAC;