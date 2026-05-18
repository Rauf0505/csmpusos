"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "@/lib/user";

export function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [initials, setInitials] = useState("AK");
  const [name, setName] = useState("User");
  const [role, setRole] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setInitials(user.initials);
      setName(user.name);
      setRole(user.role);
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth");
  };

  const roleLabels: Record<string, string> = {
    student: "Student",
    admin: "Admin",
    teacher: "Teacher",
    "department-head": "Department",
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-white">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-[12px] font-medium text-foreground leading-tight">
            {name}
          </div>
          <div className="text-[10px] text-muted-foreground">{roleLabels[role] || role}</div>
        </div>
        <ChevronDown size={14} className="text-muted-foreground hidden md:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border/80 py-1 z-50"
          >
            <div className="px-3 py-2 border-b border-border/60">
              <div className="text-[12px] font-medium text-foreground">{name}</div>
              <div className="text-[10px] text-muted-foreground">{roleLabels[role] || role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
