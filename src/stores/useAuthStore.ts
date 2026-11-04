import { create } from "zustand";
import { User, UserRole } from "@/types/auth";

export const MOCK_USERS: Record<UserRole, User> = {
  creator: {
    id: "usr_creator_01",
    name: "Alex Morgan",
    email: "alex.creator@inkloom.ai",
    role: "creator",
    department: "Content & Growth Marketing",
  },
  "brand-manager": {
    id: "usr_bm_02",
    name: "Sarah Chen",
    email: "sarah.brand@inkloom.ai",
    role: "brand-manager",
    department: "Global Brand & Governance",
  },
  admin: {
    id: "usr_admin_03",
    name: "Marcus Vance",
    email: "marcus.admin@inkloom.ai",
    role: "admin",
    department: "System Architecture & Compliance",
  },
};

interface AuthState {
  currentUser: User | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  loginAs: (role: UserRole, customEmail?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  activeRole: "creator",
  isAuthenticated: false,
  loginAs: (role, customEmail) => {
    const baseUser = MOCK_USERS[role];
    const user: User = customEmail
      ? { ...baseUser, email: customEmail }
      : baseUser;
    set({
      currentUser: user,
      activeRole: role,
      isAuthenticated: true,
    });
  },
  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
    });
  },
  switchRole: (role) => {
    const user = MOCK_USERS[role];
    set({
      currentUser: user,
      activeRole: role,
      isAuthenticated: true,
    });
  },
}));

