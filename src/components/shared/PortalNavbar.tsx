"use client";

import { Building2, ShieldCheck } from "lucide-react";
import type { Role } from "@/lib/types";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

const roleIcons: Record<string, React.ReactNode> = {
  student: <Building2 size={15} className="text-white" />,
  admin: <ShieldCheck size={15} className="text-white" />,
};

export function PortalNavbar({
  role,
  title,
  badge,
  theme = "light",
}: {
  role: Role;
  title: string;
  badge?: string;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";

  return (
    <header
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
      }}
      className="h-[60px] flex items-center px-4 md:px-6 gap-4 shrink-0"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
          {roleIcons[role] || <Building2 size={15} className="text-white" />}
        </div>
        <span
          style={{ color: isDark ? "#ffffff" : undefined }}
          className="font-heading text-[15px] font-semibold tracking-tight"
        >
          CampusOS{" "}
          <span style={{ color: isDark ? "rgba(255,255,255,0.6)" : undefined }} className="font-normal text-muted-foreground">
            {title}
          </span>
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {badge && (
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full"
            style={{ background: isDark ? "#1e3a5f" : "#eff6ff", color: isDark ? "#60a5fa" : "#2563eb" }}
          >
            {badge}
          </span>
        )}
        <NotificationBell isDark={isDark} />
        <UserMenu />
      </div>
    </header>
  );
}
