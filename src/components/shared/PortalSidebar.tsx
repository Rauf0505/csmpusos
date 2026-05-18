"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Role } from "@/lib/types";

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function PortalSidebar({
  items,
  role,
  theme = "light",
}: {
  items: SidebarItem[];
  role: Role;
  theme?: "light" | "dark";
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === "dark";

  return (
    <motion.aside
      animate={{ width: collapsed ? 48 : 180 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
      }}
      className="flex flex-col shrink-0 h-full overflow-hidden"
    >
      <div className="flex-1 py-3 px-1.5 flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-150 cursor-pointer relative ${
                  active
                    ? isDark
                      ? "font-medium"
                      : "bg-blue-50 text-blue-600 font-medium"
                    : isDark
                      ? "hover:bg-white/5"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                style={
                  active && isDark
                    ? { background: "rgba(37,99,235,0.2)", color: "#60a5fa" }
                    : isDark && !active
                    ? { color: "rgba(255,255,255,0.5)" }
                    : {}
                }
              >
                {active && (
                  <motion.div
                    layoutId={`sidebar-active-${role}`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full"
                    style={{ background: isDark ? "#60a5fa" : "#2563eb" }}
                  />
                )}
                <span className="shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[12.5px] whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          color: isDark ? "rgba(255,255,255,0.4)" : undefined,
        }}
        className="flex items-center justify-center py-3 hover:bg-muted/30 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}
