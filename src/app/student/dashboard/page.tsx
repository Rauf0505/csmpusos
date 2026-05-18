"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/shared/StatCard";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { apiFetch } from "@/lib/api";
import { Speaker, MessageSquare, Clock, Bot, ArrowRight, Loader2 } from "lucide-react";

interface DashboardData {
  stats: {
    announcements: number;
    pendingComplaints: number;
    upcomingDeadlines: number;
    aiQueriesToday: number;
  };
  recentAnnouncements: {
    id: string;
    title: string;
    department: string;
    priority: string;
    date: string;
  }[];
}

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiFetch<DashboardData>("/api/student/dashboard").then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="p-6 md:p-8 max-w-5xl flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { stats, recentAnnouncements } = data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { staggerChildren: 0.06 } }}
      className="p-6 md:p-8 max-w-5xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-heading text-[22px] font-semibold text-foreground">
          Good morning, Ali
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening on campus today.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard label="Total Announcements" value={stats.announcements} change="Latest updates" accent="blue" icon={<Speaker size={16} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard label="Pending Complaints" value={stats.pendingComplaints} change="In review" accent="amber" icon={<MessageSquare size={16} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard label="Upcoming Deadlines" value={stats.upcomingDeadlines} change="Plan ahead" accent="purple" icon={<Clock size={16} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard label="AI Queries Today" value={stats.aiQueriesToday} change="Active" accent="cyan" icon={<Bot size={16} />} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-3">Recent announcements</h2>
        <div className="space-y-2">
          {recentAnnouncements.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-border/80 rounded-lg p-3.5 flex items-center gap-3 hover:border-blue-200 transition-colors cursor-pointer"
            >
              <PriorityBadge priority={ann.priority as "Urgent" | "Exam" | "Event" | "Hostel" | "Normal"} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-foreground truncate">{ann.title}</div>
                <div className="text-[11px] text-muted-foreground">{ann.department} · {ann.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => router.push("/student/ai")}
          className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5 flex items-center justify-between group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot size={20} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Ask me anything...</div>
              <div className="text-[12px] text-muted-foreground">Your AI campus assistant is ready to help</div>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
