export interface Permission {
  id: string;
  name: string;
  description: string;
}

export const SystemPermissions = {
  USER_READ: {
    id: "USER_READ",
    name: "Read User",
    description: "Ability to view user information",
  },
  USER_WRITE: {
    id: "USER_WRITE",
    name: "Write User",
    description: "Ability to modify user information",
  },
  ADMIN_PANEL_ACCESS: {
    id: "ADMIN_PANEL_ACCESS",
    name: "Admin Panel",
    description: "Access to administrative dashboard",
  },
};

export const RolePermissionsMap = {
  [UserRole.GUEST]: [],
  [UserRole.USER]: [SystemPermissions.USER_READ],
  [UserRole.MODERATOR]: [
    SystemPermissions.USER_READ,
    SystemPermissions.USER_WRITE,
  ],
  [UserRole.ADMIN]: [
    SystemPermissions.USER_READ,
    SystemPermissions.USER_WRITE,
    SystemPermissions.ADMIN_PANEL_ACCESS,
  ],
  [UserRole.SUPER_ADMIN]: Object.values(SystemPermissions),
};
