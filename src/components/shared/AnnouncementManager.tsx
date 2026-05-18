"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { AnnouncementCard } from "./AnnouncementCard";
import { EmptyState } from "./EmptyState";
import type { Role, Announcement } from "@/lib/types";
import { Speaker, Send, X, Loader2, Pencil, Trash2, Globe, Building2, GraduationCap, Users, User } from "lucide-react";

interface AnnouncementManagerProps {
  role: Role;
  title?: string;
  canCreate?: boolean;
  showOnlyMine?: boolean;
}

interface ClassOption {
  id: string;
  name: string;
  department_name: string;
}

type HodAudience = "all" | "faculty" | "students" | "classes";

const priorityOptions = ["Normal", "Exam", "Event", "Hostel", "Urgent"];

export function AnnouncementManager({
  role,
  title = "Announcements",
  canCreate = true,
  showOnlyMine = false,
}: AnnouncementManagerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState("Normal");
  const [formCategory, setFormCategory] = useState("All");

  // Admin state
  const [adminVisType, setAdminVisType] = useState<"global" | "department" | "class">("global");
  const [adminDept, setAdminDept] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  // HOD state
  const [hodAudience, setHodAudience] = useState<HodAudience>("all");

  // Shared
  const [allClasses, setAllClasses] = useState<ClassOption[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch departments
  useEffect(() => {
    apiFetch<{ departments: { id: string; name: string }[] }>("/api/departments")
      .then((d) => { setDepartments(d.departments); if (d.departments.length > 0) setAdminDept(d.departments[0].id); })
      .catch(() => {});
  }, []);

  // Fetch appropriate classes per role
  useEffect(() => {
    let url = "/api/classes";
    if (role === "teacher") url = "/api/classes/mine";
    else if (role === "department-head") url = "/api/classes/mine"; // returns department's classes
    apiFetch<{ classes: ClassOption[] }>(url).then((d) => setAllClasses(d.classes)).catch(() => {});
  }, [role]);

  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (showOnlyMine || role !== "admin") params.set("role", role);
    apiFetch<{ announcements: Announcement[] }>(`/api/announcements?${params}`)
      .then((data) => { setAnnouncements(data.announcements); setLoading(false); })
      .catch(() => setLoading(false));
  }, [role, showOnlyMine]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const resetForm = () => {
    setFormTitle(""); setFormDesc("");
    setFormPriority("Normal"); setFormCategory("All");
    setSelectedClasses([]);
    setAdminVisType("global");
    setHodAudience("all");
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormTitle(ann.title);
    setFormDesc(ann.description);
    setFormPriority(ann.priority);
    setFormCategory(ann.category);
    setSelectedClasses(
      (ann.recipients || []).filter((r) => r.recipient_type === "class").map((r) => r.recipient_id).filter(Boolean) as string[]
    );

    if (role === "admin") {
      setAdminVisType((ann.visibilityType || "global") as "global" | "department" | "class");
    } else if (role === "department-head") {
      const vt = ann.visibilityType;
      if (vt === "class") setHodAudience("classes");
      else if (vt === "department") {
        // check targetRoles to determine faculty/students/all
        const tr = ann.targetRoles || [];
        if (tr.includes("teacher") && !tr.includes("student")) setHodAudience("faculty");
        else if (tr.includes("student") && !tr.includes("teacher")) setHodAudience("students");
        else setHodAudience("all");
      }
    }
    setShowForm(true);
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSave = async () => {
    if (!formTitle || !formDesc) return;
    setSaving(true);
    try {
      let visibilityType: string;
      let recipients: { recipient_type: string; recipient_id: string | null }[] = [];
      let targetRoles: string[] = [];

      if (role === "admin") {
        visibilityType = adminVisType;
        if (adminVisType === "global") {
          recipients = [{ recipient_type: "all", recipient_id: null }];
          targetRoles = ["student", "teacher", "department-head"];
        } else if (adminVisType === "department") {
          visibilityType = "department";
          recipients = [{ recipient_type: "department", recipient_id: adminDept }];
          targetRoles = ["student", "teacher", "department-head"];
        } else {
          visibilityType = "class";
          recipients = selectedClasses.map((cid) => ({ recipient_type: "class", recipient_id: cid }));
          targetRoles = ["student", "teacher"];
        }
      } else if (role === "department-head") {
        if (hodAudience === "classes") {
          visibilityType = "class";
          recipients = selectedClasses.map((cid) => ({ recipient_type: "class", recipient_id: cid }));
          targetRoles = ["student", "teacher"];
        } else {
          visibilityType = "department";
          // No department ID needed — backend uses HOD's own department
          if (hodAudience === "faculty") {
            targetRoles = ["teacher", "department-head"];
          } else if (hodAudience === "students") {
            targetRoles = ["student"];
          } else {
            targetRoles = ["student", "teacher", "department-head"];
          }
        }
      } else {
        // Teacher
        visibilityType = "class";
        recipients = selectedClasses.map((cid) => ({ recipient_type: "class", recipient_id: cid }));
        targetRoles = ["student", "teacher"];
      }

      const body = {
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        category: formCategory,
        targetRoles,
        visibilityType,
        recipients,
      };

      if (editingId) {
        await apiFetch(`/api/announcements/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/announcements", { method: "POST", body: JSON.stringify(body) });
      }
    } catch {}
    setShowForm(false);
    setEditingId(null);
    setSaving(false);
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await apiFetch(`/api/announcements/${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch {}
  };

  // ── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-[22px] font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{announcements.length} total</p>
        </div>
        {canCreate && (
          <button onClick={() => { if (showForm) setShowForm(false); else openCreate(); }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${showForm ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-white hover:bg-primary-dark"}`}>
            {showForm ? <X size={14} /> : <Send size={14} />}
            {showForm ? "Cancel" : "New Announcement"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
            <div className="bg-white border border-border/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-foreground">{editingId ? "Edit Announcement" : "New Announcement"}</h3>

              <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Announcement title..."
                className="w-full h-10 px-3.5 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />

              <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Write announcement details..." rows={4}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none" />

              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Priority</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-background outline-none focus:border-primary">
                    {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-background outline-none focus:border-primary">
                    <option value="All">General</option><option value="Exams">Exams</option><option value="Events">Events</option><option value="Admissions">Admissions</option><option value="Hostel">Hostel</option>
                  </select>
                </div>
              </div>

              {/* ── ADMIN FORM ─────────────────────────────────────────── */}
              {role === "admin" && (
                <>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Audience</label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: "global" as const, label: "Global (Everyone)", icon: <Globe size={14} /> },
                        { value: "department" as const, label: "Department", icon: <Building2 size={14} /> },
                        { value: "class" as const, label: "Specific Classes", icon: <GraduationCap size={14} /> },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => setAdminVisType(opt.value)}
                          className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${adminVisType === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border/80 text-muted-foreground hover:border-border"}`}>
                          {opt.icon}{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(adminVisType === "department" || adminVisType === "class") && (
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Department</label>
                      <select value={adminDept} onChange={(e) => setAdminDept(e.target.value)}
                        className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-background outline-none focus:border-primary">
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}

                  {adminVisType === "class" && (
                    <ClassSelector classes={allClasses} selected={selectedClasses} onToggle={toggleClass} />
                  )}
                </>
              )}

              {/* ── HOD FORM ───────────────────────────────────────────── */}
              {role === "department-head" && (
                <>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Send to</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { value: "all" as HodAudience, label: "Entire Department", icon: <Building2 size={16} /> },
                        { value: "faculty" as HodAudience, label: "Faculty Only", icon: <Users size={16} /> },
                        { value: "students" as HodAudience, label: "Students Only", icon: <User size={16} /> },
                        { value: "classes" as HodAudience, label: "Specific Classes", icon: <GraduationCap size={16} /> },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => setHodAudience(opt.value)}
                          className={`px-3 py-3 text-[11px] font-medium rounded-lg border transition-colors flex flex-col items-center gap-1 text-center ${hodAudience === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border/80 text-muted-foreground hover:border-border"}`}>
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {hodAudience === "classes" && (
                    <ClassSelector classes={allClasses} selected={selectedClasses} onToggle={toggleClass} />
                  )}
                </>
              )}

              {/* ── TEACHER FORM ────────────────────────────────────────── */}
              {role === "teacher" && (
                <ClassSelector classes={allClasses} selected={selectedClasses} onToggle={toggleClass} label="Select your class(es)" />
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-medium border border-border/80 rounded-lg hover:bg-muted/50 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={!formTitle || !formDesc || saving || (role !== "admin" && hodAudience === "classes" && selectedClasses.length === 0) || (role === "admin" && adminVisType === "class" && selectedClasses.length === 0) || (role === "teacher" && selectedClasses.length === 0)}
                  className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 flex items-center gap-1.5">
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  {editingId ? "Update" : "Publish"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : announcements.length > 0 ? (
        <div className="space-y-2.5">
          {announcements.map((ann, i) => (
            <div key={ann.id} className="group relative">
              {role === "admin" && (
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(ann)} className="p-1.5 rounded-md bg-white border border-border/80 hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors shadow-sm" title="Edit">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded-md bg-white border border-border/80 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors shadow-sm" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
              <AnnouncementCard data={ann} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Speaker size={24} />} title="No announcements yet" desc="Create your first announcement" />
      )}
    </div>
  );
}

// ── Class Selector Sub-component ───────────────────────────────────────────

function ClassSelector({
  classes,
  selected,
  onToggle,
  label = "Select class(es)",
}: {
  classes: ClassOption[];
  selected: string[];
  onToggle: (id: string) => void;
  label?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {classes.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1">
            {classes.map((c) => (
              <button key={c.id} onClick={() => onToggle(c.id)}
                className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg border text-left transition-colors ${selected.includes(c.id) ? "border-primary bg-primary/5 text-primary" : "border-border/80 text-muted-foreground hover:border-border"}`}>
                {c.name}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">{selected.length} class(es) selected</p>
          )}
        </>
      ) : (
        <p className="text-[11px] text-muted-foreground py-2">No classes available. Create classes first.</p>
      )}
    </div>
  );
}
