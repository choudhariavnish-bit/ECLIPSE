import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserRole } from "@/types/auth";
import { api } from "@/lib/api";

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
  setUser: (user: User) => void;
  loginAs: (role: UserRole, customEmail?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      activeRole: "creator",
      isAuthenticated: false,
      setUser: (user: User) => {
        set({
          currentUser: user,
          activeRole: user.role,
          isAuthenticated: true,
        });
      },
      loginAs: (role, customEmail) => {
        const baseUser = MOCK_USERS[role];
        api.auth.login(customEmail || baseUser.email, "password123").catch(() => {});
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
        api.auth.logout();
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
    }),
    {
      name: "inkloom_auth_session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
