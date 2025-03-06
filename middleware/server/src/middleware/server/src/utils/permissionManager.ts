import { UserRole } from "../types/user";

interface Permission {
  id: string;
  name: string;
  description: string;
}

class PermissionManager {
  private static PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.GUEST]: [],
    [UserRole.USER]: [
      {
        id: "profile_view",
        name: "View Profile",
        description: "Ability to view own profile",
      },
    ],
    [UserRole.MODERATOR]: [
      ...this.PERMISSIONS[UserRole.USER],
      {
        id: "user_management",
        name: "User Management",
        description: "Ability to manage user accounts",
      },
    ],
    [UserRole.ADMIN]: [
      ...this.PERMISSIONS[UserRole.MODERATOR],
      {
        id: "system_config",
        name: "System Configuration",
        description: "Ability to configure system settings",
      },
    ],
    [UserRole.SUPER_ADMIN]: [
      ...this.PERMISSIONS[UserRole.ADMIN],
      {
        id: "full_access",
        name: "Full System Access",
        description: "Unrestricted access to all system features",
      },
    ],
  };

  static hasPermission(userRole: UserRole, permissionId: string): boolean {
    return this.PERMISSIONS[userRole].some(
      (permission) => permission.id === permissionId
    );
  }

  static getRolePermissions(role: UserRole): Permission[] {
    return this.PERMISSIONS[role];
  }

  static canPerformAction(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = [
      UserRole.GUEST,
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ];

    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  }
}

export default PermissionManager;
