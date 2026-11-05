import { create } from "zustand";
import { User, UserRole } from "@/types/auth";
import { api } from "@/lib/api";

export const MOCK_USERS: Record<UserRole, User> = {
  creator: {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Alex Morgan",
    email: "alex.creator@inkloom.ai",
    role: "creator",
    department: "Content & Growth Marketing",
  },
  "brand-manager": {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Sarah Chen",
    email: "sarah.brand@inkloom.ai",
    role: "brand-manager",
    department: "Global Brand & Governance",
  },
  admin: {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Marcus Vance",
    email: "marcus.admin@inkloom.ai",
    role: "admin",
    department: "System Architecture & Compliance",
  },
};

function getInitialUser(): User | null {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("inkloom_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
}

const initialUser = getInitialUser();

interface AuthState {
  currentUser: User | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
    organizationName?: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  loginAs: (role: UserRole, customEmail?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: initialUser,
  activeRole: initialUser?.role || "creator",
  isAuthenticated: !!initialUser,

  login: async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      const user = res.user;
      set({
        currentUser: user,
        activeRole: user.role,
        isAuthenticated: true,
      });
      return { success: true, user };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to authenticate";
      return { success: false, error: msg };
    }
  },

  register: async (data) => {
    try {
      const res = await api.auth.register(data);
      const user = res.user;
      if (typeof window !== "undefined" && res.accessToken) {
        localStorage.setItem("inkloom_access_token", res.accessToken);
        localStorage.setItem("inkloom_user", JSON.stringify(user));
      }
      set({
        currentUser: user,
        activeRole: user.role,
        isAuthenticated: true,
      });
      return { success: true, user };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Registration failed";
      return { success: false, error: msg };
    }
  },

  loginAs: (role, customEmail) => {
    const baseUser = MOCK_USERS[role];
    api.auth.login(customEmail || baseUser.email, "password123").catch(() => {});
    const user: User = customEmail
      ? { ...baseUser, email: customEmail }
      : baseUser;
    if (typeof window !== "undefined") {
      localStorage.setItem("inkloom_user", JSON.stringify(user));
    }
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
    if (typeof window !== "undefined") {
      localStorage.setItem("inkloom_user", JSON.stringify(user));
    }
    set({
      currentUser: user,
      activeRole: role,
      isAuthenticated: true,
    });
  },
}));
