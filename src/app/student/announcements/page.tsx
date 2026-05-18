"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetch } from "@/lib/api";
import { Search, Speaker, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface AnnouncementData {
  id: string; title: string; description: string; department: string;
  category: string; priority: string; targetRoles: string[]; createdBy: string; date: string;
}

const filters = ["All", "Exams", "Admissions", "Events", "Urgent", "Hostel"];

export default function AnnouncementsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ role: "student", category: activeFilter });
    if (searchQuery) params.set("search", searchQuery);
    apiFetch<{ announcements: AnnouncementData[] }>(`/api/announcements?${params}`)
      .then((data) => { setAnnouncements(data.announcements); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeFilter, searchQuery]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-[22px] font-semibold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{announcements.length} total</p>
        </div>
        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search announcements..."
            className="w-full h-9 pl-9 pr-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-medium transition-all ${activeFilter === f ? "bg-primary text-white shadow-sm" : "bg-white border border-border/80 text-muted-foreground hover:border-border"}`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : (
        <AnimatePresence mode="wait">
          {announcements.length > 0 ? (
            <motion.div key={activeFilter + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
              {announcements.map((ann, i) => <AnnouncementCard key={ann.id} data={ann} index={i} />)}
            </motion.div>
          ) : (
            <EmptyState icon={<Speaker size={24} />} title="No announcements found"
              desc={searchQuery ? "Try adjusting your search" : "No announcements in this category yet"} />
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

function AnnouncementCard({ data, index }: { data: AnnouncementData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.06 }}
      style={{ borderLeft: data.priority === "Urgent" ? "3px solid #b91c1c" : "3px solid transparent" }}
      className="bg-white border border-border/80 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <PriorityBadge priority={data.priority as "Urgent" | "Exam" | "Event" | "Hostel" | "Normal"} />
            <span className="text-[11px] text-muted-foreground">{data.department} · {data.date}</span>
          </div>
          <h3 className="text-[14px] font-medium text-foreground leading-snug mb-1">{data.title}</h3>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2">{data.description}</p>
        </div>
        <button className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="pt-3 mt-3 border-t border-border/60">
              <p className="text-[13px] text-foreground/80 leading-relaxed">{data.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
