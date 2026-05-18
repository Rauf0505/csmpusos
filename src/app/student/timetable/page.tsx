"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

export default function TimetablePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-4xl">
      <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">Timetable</h1>
      <p className="text-sm text-muted-foreground mb-6">Your class schedule</p>
      <div className="bg-white border border-border/80 rounded-lg p-8 text-center">
        <Calendar size={40} className="mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Timetable feature coming soon</p>
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-muted-foreground">
          <Clock size={12} />
          <span>Your courses and schedule will appear here once assigned</span>
        </div>
      </div>
    </motion.div>
  );
}
