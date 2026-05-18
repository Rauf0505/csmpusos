"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Speaker,
  MessageSquare,
  FileStack,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Analytics", icon: BarChart3 },
  { href: "/admin/announcements", label: "Announcements", icon: Speaker },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/admin/ai-knowledge", label: "AI Knowledge", icon: FileStack },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 48 : 160 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col shrink-0 h-full overflow-hidden"
      style={{ background: "#0f172a", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex-1 py-3 px-1.5 flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-150 cursor-pointer relative ${
                  active
                    ? "font-medium"
                    : "hover:bg-white/5"
                }`}
                style={
                  active
                    ? { background: "rgba(37,99,235,0.2)", color: "#60a5fa" }
                    : { color: "rgba(255,255,255,0.5)" }
                }
              >
                {active && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-blue-400 rounded-r-full"
                  />
                )}
                <Icon size={16} className="shrink-0" />
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
        className="flex items-center justify-center py-3 transition-colors"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {collapsed ? (
          <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        ) : (
          <ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        )}
      </button>
    </motion.aside>
  );
}
