"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/pipeline": "Pipeline",
  "/tasks": "Tasks",
  "/time": "Time Tracking",
  "/invoices": "Invoices",
  "/contracts": "Contracts",
  "/activity": "Activity",
  "/proposals": "Proposals",
  "/playbooks": "Playbooks",
  "/templates": "Templates",
  "/reports": "Reports",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const base = "/" + pathname.split("/")[1];
  return pageTitles[base] || "AccountOS";
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const title = getPageTitle(pathname);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        <Header
          title={title}
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        <main id="main-content" className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AppShell };
