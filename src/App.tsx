import React, { Suspense, useMemo } from "react";
import { useNavigationStore } from "@/lib/next-compat/routerStore";

const LoginPage = React.lazy(() => import("@/app/login/page"));
const DashboardLayout = React.lazy(() => import("@/app/dashboard/layout"));
const CreatorPage = React.lazy(() => import("@/app/dashboard/creator/page"));
const BrandManagerPage = React.lazy(() => import("@/app/dashboard/brand-manager/page"));
const AdminPage = React.lazy(() => import("@/app/dashboard/admin/page"));
const DraftsPage = React.lazy(() => import("@/app/dashboard/drafts/page"));
const RulebookPage = React.lazy(() => import("@/app/dashboard/rulebook/page"));
const DatabasePage = React.lazy(() => import("@/app/dashboard/database/page"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdffcd] via-[#ffebbb] to-[#e0ffcd] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-stone-700 text-xs font-semibold p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#ffebbb] shadow-lg">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#ffebbb] border-t-[#ffcab0]" />
        <span className="font-bold tracking-wide text-stone-800">Calibrating ECLIPSE...</span>
      </div>
    </div>
  );
}

export default function App() {
  const { currentPath } = useNavigationStore();

  const renderedContent = useMemo(() => {
    const cleanPath = (currentPath || "/login").split("?")[0].replace(/\/+$/, "");

    if (!cleanPath || cleanPath === "/" || cleanPath === "/login") {
      return <LoginPage />;
    }

    let pageComponent: React.ReactNode;

    switch (cleanPath) {
      case "/dashboard/creator":
        pageComponent = <CreatorPage />;
        break;
      case "/dashboard/brand-manager":
      case "/dashboard/approvals":
        pageComponent = <BrandManagerPage />;
        break;
      case "/dashboard/admin":
        pageComponent = <AdminPage />;
        break;
      case "/dashboard/drafts":
        pageComponent = <DraftsPage />;
        break;
      case "/dashboard/rulebook":
        pageComponent = <RulebookPage />;
        break;
      case "/dashboard/database":
        pageComponent = <DatabasePage />;
        break;
      default:
        if (cleanPath.startsWith("/dashboard/creator")) pageComponent = <CreatorPage />;
        else if (cleanPath.startsWith("/dashboard/brand-manager") || cleanPath.startsWith("/dashboard/approvals")) pageComponent = <BrandManagerPage />;
        else if (cleanPath.startsWith("/dashboard/admin")) pageComponent = <AdminPage />;
        else if (cleanPath.startsWith("/dashboard/drafts")) pageComponent = <DraftsPage />;
        else if (cleanPath.startsWith("/dashboard/rulebook")) pageComponent = <RulebookPage />;
        else if (cleanPath.startsWith("/dashboard/database")) pageComponent = <DatabasePage />;
        else pageComponent = <LoginPage />;
        break;
    }

    return <DashboardLayout>{pageComponent}</DashboardLayout>;
  }, [currentPath]);

  return <Suspense fallback={<PageLoader />}>{renderedContent}</Suspense>;
}
