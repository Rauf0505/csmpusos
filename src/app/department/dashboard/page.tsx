"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Loader2, Users, BookOpen, Speaker, GraduationCap, IdCard } from "lucide-react";

interface FacultyMember {
  name: string;
  email: string;
  department: string;
  courses: number;
  students: number;
}

interface Student {
  name: string;
  email: string;
  student_id: string | null;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  created_at: string;
}

interface DashboardData {
  stats: {
    totalTeachers: number;
    totalStudents: number;
    totalCourses: number;
    announcements: number;
  };
  faculty: FacultyMember[];
  students: Student[];
  announcements: Announcement[];
}

const statCards = [
  { key: "totalTeachers", label: "Total Faculty", icon: GraduationCap, color: "#2563eb", bg: "#eff6ff" },
  { key: "totalStudents", label: "Total Students", icon: Users, color: "#7c3aed", bg: "#faf5ff" },
  { key: "totalCourses", label: "Active Courses", icon: BookOpen, color: "#06b6d4", bg: "#ecfeff" },
  { key: "announcements", label: "Announcements", icon: Speaker, color: "#16a34a", bg: "#f0fdf4" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr + "Z");
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const priorityStyles: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700",
  Exam: "bg-amber-100 text-amber-700",
  Event: "bg-blue-100 text-blue-700",
  Normal: "bg-gray-100 text-gray-600",
  Hostel: "bg-purple-100 text-purple-700",
};

export default function DepartmentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    apiFetch<DashboardData>("/api/department/dashboard")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = data?.stats;
  const faculty = data?.faculty || [];
  const students = data?.students || [];
  const announcements = data?.announcements || [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">Department Dashboard</h1>
        <p className="text-sm text-muted-foreground">Head of Department overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key as keyof typeof stats] : 0;
          return (
            <div key={card.key} className="bg-white border border-border/80 rounded-lg p-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: card.bg, color: card.color }}
              >
                <Icon size={18} />
              </div>
              <div className="text-2xl font-semibold text-foreground">{value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Students */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">Students ({students.length})</h2>
        {students.length > 0 ? (
          <div className="bg-white border border-border/80 rounded-lg divide-y divide-border/60">
            {students.map((s, i) => (
              <motion.div
                key={s.email}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-xs font-medium text-purple-600 shrink-0">
                  {getInitials(s.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-foreground truncate">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.email}</div>
                </div>
                {s.student_id && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
                    <IdCard size={11} />
                    <span>{s.student_id}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border/80 rounded-lg p-8 text-center">
            <Users size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No students found in this department.</p>
          </div>
        )}
      </section>

      {/* Faculty Overview */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">Faculty Members ({faculty.length})</h2>
        {faculty.length > 0 ? (
          <div className="space-y-2.5">
            {faculty.map((f, i) => (
              <motion.div
                key={f.email}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-border/80 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {getInitials(f.name)}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {f.email} &middot; {f.courses} courses &middot; {f.students} students
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border/80 rounded-lg p-8 text-center">
            <GraduationCap size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No faculty members found.</p>
          </div>
        )}
      </section>

      {/* Recent Announcements */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">Recent Announcements</h2>
        {announcements.length > 0 ? (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="bg-white border border-border/80 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">{a.title}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityStyles[a.priority] || priorityStyles.Normal}`}>
                      {a.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border/80 rounded-lg p-8 text-center">
            <Speaker size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No announcements available.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
