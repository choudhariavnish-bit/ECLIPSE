export type UserRole = "creator" | "brand-manager" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
  dashboardPath: string;
  iconName: string;
  accentColor: string;
}

