"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Users, Loader2 } from "lucide-react";
export default function FacultyPage() {
  const [faculty, setFaculty] = useState<{ name: string; email: string; department: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch<{ faculty: { name: string; email: string; department: string }[] }>("/api/department/faculty")
      .then((d) => setFaculty(d.faculty)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-4xl">
    <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">Faculty</h1>
    <p className="text-sm text-muted-foreground mb-6">{faculty.length} faculty members</p>
    {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
    : faculty.length > 0 ? <div className="space-y-2">
      {faculty.map((f) => <div key={f.email} className="bg-white border border-border/80 rounded-lg p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
          {f.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div><div className="text-[13px] font-medium text-foreground">{f.name}</div><div className="text-[11px] text-muted-foreground">{f.email} · {f.department}</div></div>
      </div>)}
    </div> : <div className="bg-white border border-border/80 rounded-lg p-12 text-center"><Users size={48} className="mx-auto mb-3 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No faculty found</p></div>}
  </motion.div>;
}
