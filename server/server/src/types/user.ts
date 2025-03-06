export enum UserRole {
  GUEST = "GUEST",
  USER = "USER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
}

export interface UserSettings {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  settings: UserSettings;
  socialLinks?: SocialLinks;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}
