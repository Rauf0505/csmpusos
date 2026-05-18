"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-4xl">
      <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your account preferences</p>
      <div className="bg-white border border-border/80 rounded-lg p-8 text-center">
        <Settings size={40} className="mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Settings panel coming soon</p>
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-muted-foreground">
          <span>Profile, password, and notification preferences</span>
        </div>
      </div>
    </motion.div>
  );
}
