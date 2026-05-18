"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { BookOpen, Clock, Plus, Loader2 } from "lucide-react";

interface CourseData {
  id: string; name: string; code: string; teacherName: string | null;
  department: string | null; semester: string | null; credits: number;
  schedule: string | null; room: string | null; color: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const data = await apiFetch<{ courses: CourseData[] }>("/api/courses");
      setCourses(data.courses || []);
    } catch {}
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">My Courses</h1>
          <p className="text-sm text-muted-foreground">{courses.length} courses</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1.5">
          <Plus size={14} /> Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white border border-border/80 rounded-lg p-5 hover:border-blue-200 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ background: c.color }}>{c.code.slice(-3)}</div>
                  <div>
                    <h3 className="text-[14px] font-medium text-foreground">{c.name}</h3>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{c.code} · {c.credits} credits{c.semester ? ` · ${c.semester}` : ""}</div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      {c.schedule && <span className="flex items-center gap-1"><Clock size={12} />{c.schedule}</span>}
                      {c.room && <span className="flex items-center gap-1"><BookOpen size={12} />{c.room}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-[11px] font-medium border border-border/80 rounded-lg hover:bg-muted/50">Attendance</button>
                  <button className="px-3 py-1.5 text-[11px] font-medium bg-primary text-white rounded-lg hover:bg-primary-dark">Manage</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <BookOpen size={32} className="mb-2 opacity-40" />
          <p className="text-sm">No courses yet. Create one to get started.</p>
        </div>
      )}
    </motion.div>
  );
}
