"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { BookOpen, Users, ClipboardCheck, Clock, Loader2 } from "lucide-react";

interface DashboardData {
  stats: { courses: number; totalStudents: number; pendingGrading: number; classesToday: number };
  courses: { code: string; name: string; students: number; schedule: string; room: string }[];
}

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiFetch<DashboardData>("/api/teacher/dashboard").then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="p-6 md:p-8 max-w-5xl flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap = [BookOpen, Users, ClipboardCheck, Clock];
  const colorMap = ["#2563eb", "#7c3aed", "#f59e0b", "#06b6d4"];
  const bgMap = ["#eff6ff", "#faf5ff", "#fef9c3", "#ecfeff"];
  const statEntries = [
    { label: "My Courses", value: data.stats.courses },
    { label: "Total Students", value: data.stats.totalStudents },
    { label: "Pending Grading", value: data.stats.pendingGrading },
    { label: "Classes Today", value: data.stats.classesToday },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-5xl">
      <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">Faculty Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your courses and students</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statEntries.map((s, i) => {
          const Icon = iconMap[i];
          return (
            <div key={s.label} className="bg-white border border-border/80 rounded-lg p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: bgMap[i], color: colorMap[i] }}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-semibold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>
      <h2 className="text-sm font-medium text-foreground mb-3">My Courses</h2>
      <div className="space-y-2.5">
        {data.courses.map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-border/80 rounded-lg p-4 flex items-center justify-between hover:border-blue-200 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-mono text-primary font-medium">{c.code}</span>
                <span className="text-[13px] font-medium text-foreground">{c.name}</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex gap-3">
                <span>{c.students} students</span>
                <span>{c.schedule}</span>
                <span>{c.room}</span>
              </div>
            </div>
            <button className="text-[11px] font-medium text-primary hover:text-primary-dark">Manage</button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
