"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { apiFetch } from "@/lib/api";
import {
  Users, MessageSquare, Bot, Speaker, Loader2, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

function AnimatedStatCard({ icon, label, target, iconColor, bgColor }: { icon: React.ReactNode; label: string; target: number; iconColor: string; bgColor: string }) {
  const { count, ref } = useCountUp(target);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-border/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] rounded-xl p-5 flex items-center gap-4 transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bgColor, color: iconColor }}>
        {icon}
      </div>
      <div>
        <div className="text-[12px] text-muted-foreground font-medium mb-0.5">{label}</div>
        <div className="text-2xl font-bold text-foreground tracking-tight">{count.toLocaleString()}</div>
      </div>
    </motion.div>
  );
}

interface DashboardData {
  stats: { activeStudents: number; openComplaints: number; aiQueriesToday: number; liveAnnouncements: number };
  totalComplaints: number;
  aiHourlyData: { hour: string; queries: number }[];
  activityFeed: { id: string; type: string; description: string; timestamp: string }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiFetch<DashboardData>("/api/admin/dashboard").then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="p-6 md:p-8 max-w-6xl flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { stats, totalComplaints, aiHourlyData, activityFeed } = data;

  const exportCSV = (type: string) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return;
    window.open(`/api/export?type=${type}&token=${token}`, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Campus activity overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV("complaints")} className="px-3.5 py-2 text-[12px] font-medium bg-white shadow-sm border border-border/60 rounded-lg hover:bg-muted/50 flex items-center gap-2 transition-colors">
            <Download size={14} className="text-muted-foreground" /> Complaints CSV
          </button>
          <button onClick={() => exportCSV("students")} className="px-3.5 py-2 text-[12px] font-medium bg-white shadow-sm border border-border/60 rounded-lg hover:bg-muted/50 flex items-center gap-2 transition-colors">
            <Download size={14} className="text-muted-foreground" /> Students CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnimatedStatCard icon={<Users size={22} />} label="Active students" target={stats.activeStudents} iconColor="#2563eb" bgColor="#eff6ff" />
        <AnimatedStatCard icon={<MessageSquare size={22} />} label="Open complaints" target={stats.openComplaints} iconColor="#d97706" bgColor="#fef3c7" />
        <AnimatedStatCard icon={<Bot size={22} />} label="AI queries today" target={stats.aiQueriesToday} iconColor="#0891b2" bgColor="#cffafe" />
        <AnimatedStatCard icon={<Speaker size={22} />} label="Announcements live" target={stats.liveAnnouncements} iconColor="#7c3aed" bgColor="#f3e8ff" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-border/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-4">Complaints overview</h3>
          <div className="flex-1 min-h-[200px] flex items-center justify-between">
            <div className="w-1/2 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Open", value: stats.openComplaints },
                      { name: "Resolved", value: totalComplaints - stats.openComplaints },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[45%] flex flex-col gap-4">
              <div>
                <div className="text-3xl font-bold tracking-tight text-foreground">{totalComplaints}</div>
                <div className="text-[12px] text-muted-foreground font-medium mt-0.5">Total submitted</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[12px] text-muted-foreground"><strong className="text-foreground font-semibold">{stats.openComplaints}</strong> Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[12px] text-muted-foreground"><strong className="text-foreground font-semibold">{totalComplaints - stats.openComplaints}</strong> Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-border/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI Queries — Peak Hours</h3>
          <div className="h-[200px]">
            {aiHourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiHourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="queries" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No AI query data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-border/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent activity</h3>
        <div className="space-y-0">
          {activityFeed.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    event.type === "complaint" ? "#fef9c3" :
                    event.type === "announcement" ? "#eff6ff" :
                    event.type === "ai" ? "#ecfeff" : "#f0fdf4",
                }}
              >
                {event.type === "complaint" ? <MessageSquare size={13} className="text-amber-600" /> :
                 event.type === "announcement" ? <Speaker size={13} className="text-blue-600" /> :
                 event.type === "ai" ? <Bot size={13} className="text-cyan-600" /> :
                 <Users size={13} className="text-green-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-foreground truncate">{event.description}</div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{event.timestamp}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
