"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function NotificationBell({ isDark = false }: { isDark?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await apiFetch<{ unreadCount: number }>("/api/notifications?unread=true");
        setCount(data.unreadCount || 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.button
      className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/30 transition-colors"
      style={{ background: isDark ? "rgba(255,255,255,0.08)" : undefined }}
    >
      <Bell size={15} style={{ color: isDark ? "rgba(255,255,255,0.6)" : undefined }} className="text-muted-foreground" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[9px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </motion.button>
  );
}
