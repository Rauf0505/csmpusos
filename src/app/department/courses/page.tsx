"use client";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";
export default function DeptCourses() {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-4xl">
    <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">Courses</h1>
    <p className="text-sm text-muted-foreground mb-6">Department course management</p>
    <div className="bg-white border border-border/80 rounded-lg p-12 text-center">
      <BookOpen size={48} className="mx-auto mb-3 text-muted-foreground/30" />
      <p className="text-[15px] font-medium text-foreground mb-1">This feature will be available in Phase 2</p>
      <p className="text-[12px] text-muted-foreground">Module under development</p>
      <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-muted-foreground">
        <Clock size={12} /><span>Manage courses, curricula, and semester planning</span>
      </div>
    </div>
  </motion.div>;
}
