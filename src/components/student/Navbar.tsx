"use client";

import { useState } from "react";
import { Search, Building2 } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { UserMenu } from "@/components/shared/UserMenu";

export function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-[60px] bg-white border-b border-border/80 flex items-center px-4 md:px-6 gap-4 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
          <Building2 size={15} className="text-white" />
        </div>
        <span className="font-heading text-[16px] font-semibold text-foreground tracking-tight">
          CampusOS
        </span>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-200 w-full max-w-[420px] ${
            searchFocused
              ? "border-primary shadow-sm bg-white"
              : "border-border/80 bg-muted/50"
          }`}
        >
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            placeholder="Search announcements, complaints, ask AI…"
            className="bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground/60 outline-none flex-1 min-w-0"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
