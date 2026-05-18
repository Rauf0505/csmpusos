"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusChip } from "@/components/shared/StatusChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetch } from "@/lib/api";
import type { ComplaintStatus } from "@/lib/types";
import {
  MessageSquare,
  Search,
  MoreHorizontal,
} from "lucide-react";

interface ComplaintData {
  id: string;
  userId: string;
  userName: string;
  title: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await apiFetch<{ complaints: ComplaintData[] }>("/api/complaints");
      setComplaints(data.complaints || []);
    } catch {}
    setLoading(false);
  };

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c.id));
    }
  };

  const bulkResolve = async () => {
    for (const id of selectedIds) {
      await apiFetch(`/api/complaints/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "resolved" }),
      });
    }
    setSelectedIds([]);
    fetchComplaints();
  };

  const updateStatus = async (id: string, status: string) => {
    await apiFetch(`/api/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    setOpenDropdown(null);
    fetchComplaints();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-6 md:p-8 max-w-6xl"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-[22px] font-semibold text-foreground">
            Complaints
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {complaints.length} total · {complaints.filter((c) => c.status === "pending").length} pending
          </p>
        </div>
        {selectedIds.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={bulkResolve}
            className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark resolved ({selectedIds.length})
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search complaints..."
            className="w-56 h-9 pl-9 pr-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | "all")}
          className="h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground outline-none focus:border-primary"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="in-review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : filtered.length > 0 ? (
        <div className="bg-white border border-border/80 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    ID
                  </th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Student
                  </th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Title
                  </th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Submitted
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground font-mono">
                        {c.id.slice(0, 6)}
                      </td>
                      <td className="px-4 py-3 text-[12.5px] text-foreground font-medium">
                        {c.userName}
                      </td>
                      <td className="px-4 py-3 text-[12.5px] text-foreground max-w-[200px] truncate">
                        {c.title}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={c.status as ComplaintStatus} />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">
                        {c.createdAt}
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === c.id ? null : c.id)}
                          className="p-1 rounded-md hover:bg-muted transition-colors"
                        >
                          <MoreHorizontal size={15} className="text-muted-foreground" />
                        </button>
                        {openDropdown === c.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-0 top-full mt-1 w-40 bg-white border border-border/80 rounded-lg shadow-lg z-10 py-1"
                          >
                            {(["pending", "in-review", "resolved"] as ComplaintStatus[]).map(
                              (s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(c.id, s)}
                                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted transition-colors ${
                                    c.status === s ? "text-primary font-medium" : "text-foreground"
                                  }`}
                                >
                                  {s === "pending"
                                    ? "Pending"
                                    : s === "in-review"
                                    ? "In Review"
                                    : "Resolved"}
                                </button>
                              )
                            )}
                            <div className="border-t border-border/40 my-1" />
                            <button className="w-full text-left px-3 py-1.5 text-[12px] text-foreground hover:bg-muted transition-colors">
                              Assign
                            </button>
                            <button className="w-full text-left px-3 py-1.5 text-[12px] text-foreground hover:bg-muted transition-colors">
                              Reply
                            </button>
                          </motion.div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare size={24} />}
          title="No complaints found"
          desc="Try adjusting your filters"
        />
      )}

      {openDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </motion.div>
  );
}
