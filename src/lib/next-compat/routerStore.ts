import { create } from "zustand";

interface NavigationState {
  currentPath: string;
  navigate: (path: string) => void;
}

const getInitialPath = (): string => {
  if (typeof window === "undefined") return "/login";
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) return hash;
  if (window.location.pathname && window.location.pathname !== "/") {
    return window.location.pathname;
  }
  const authSession = localStorage.getItem("eclipse_auth_session") || localStorage.getItem("inkloom_auth_session");
  if (authSession) {
    try {
      const parsed = JSON.parse(authSession);
      if (parsed.state?.isAuthenticated && parsed.state?.activeRole) {
        return `/dashboard/${parsed.state.activeRole}`;
      }
    } catch {}
  }
  return "/login";
};

export const useNavigationStore = create<NavigationState>((set) => {
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) set({ currentPath: hash });
    });
    window.addEventListener("popstate", () => {
      const path = window.location.pathname || "/";
      set({ currentPath: path });
    });
  }

  return {
    currentPath: getInitialPath(),
    navigate: (path: string) => {
      if (typeof window !== "undefined") {
        window.location.hash = path;
      }
      set({ currentPath: path });
    },
  };
});

