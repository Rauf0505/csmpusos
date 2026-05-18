"use client";

import type { Role } from "@/lib/types";
import { PortalSidebar, type SidebarItem } from "./PortalSidebar";
import { PortalNavbar } from "./PortalNavbar";

export function PortalShell({
  children,
  role,
  sidebarItems,
  title,
  badge,
  theme = "light",
}: {
  children: React.ReactNode;
  role: Role;
  sidebarItems: SidebarItem[];
  title: string;
  badge?: string;
  theme?: "light" | "dark";
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#f8fafc" }}>
      <PortalNavbar role={role} title={title} badge={badge} theme={theme} />
      <div className="flex flex-1 overflow-hidden">
        <PortalSidebar items={sidebarItems} role={role} theme={theme} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
