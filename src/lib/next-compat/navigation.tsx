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
  return (currentPath || "/").split("?")[0];
}

export function useSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const currentPath = useNavigationStore.getState().currentPath || "";
  let query = "";
  if (currentPath.includes("?")) {
    query = currentPath.split("?")[1];
  } else if (window.location.hash.includes("?")) {
    query = window.location.hash.split("?")[1];
  } else if (window.location.search) {
    query = window.location.search.replace(/^\?/, "");
  }
  return new URLSearchParams(query);
}

export function useParams(): Record<string, string> {
  return {};
}

export function redirect(path: string) {
  useNavigationStore.getState().navigate(path);
}

