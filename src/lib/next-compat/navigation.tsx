import { useNavigationStore } from "./routerStore";

export function useRouter() {
  const { navigate } = useNavigationStore();
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path),
    back: () => {
      if (typeof window !== "undefined") window.history.back();
    },
    forward: () => {
      if (typeof window !== "undefined") window.history.forward();
    },
    refresh: () => {},
    prefetch: () => {},
  };
}

export function usePathname(): string {
  const { currentPath } = useNavigationStore();
  return currentPath;
}

export function useSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function useParams(): Record<string, string> {
  return {};
}

export function redirect(path: string) {
  useNavigationStore.getState().navigate(path);
}

