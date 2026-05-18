"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Speaker,
  MessageSquare,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const items = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/ai", label: "AI Assistant", icon: Bot },
  { href: "/student/announcements", label: "Announcements", icon: Speaker },
  { href: "/student/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/student/timetable", label: "Timetable", icon: Calendar },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 48 : 160 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="bg-white border-r border-border/80 flex flex-col shrink-0 h-full overflow-hidden"
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
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-blue-600 rounded-r-full"
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
        className="flex items-center justify-center py-3 border-t border-border/60 hover:bg-muted/30 transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={16} className="text-muted-foreground" />
        ) : (
          <ChevronLeft size={16} className="text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
}
