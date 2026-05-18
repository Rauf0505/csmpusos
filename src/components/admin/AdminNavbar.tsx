"use client";

import { ShieldCheck } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { UserMenu } from "@/components/shared/UserMenu";

export function AdminNavbar() {
  return (
    <header
      className="h-[60px] flex items-center px-6 gap-4 shrink-0"
      style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
          <ShieldCheck size={15} className="text-white" />
        </div>
        <span className="font-heading text-[15px] font-semibold text-white tracking-tight">
          CampusOS <span className="font-normal text-white/60">Admin</span>
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <NotificationBell isDark />
        <UserMenu />
      </div>
    </header>
  );
}
