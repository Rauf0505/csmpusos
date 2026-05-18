"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import {
  Search, Users, UserMinus, Plus, Pencil, Trash2,
  GraduationCap, ShieldCheck, BookOpen, Building2,
  X, Check, Loader2, Upload, Download,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin" | "department-head";
  department: string | null;
  studentId: string | null;
  initials: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_TABS = [
  { value: "all", label: "All" },
  { value: "student", label: "Students", icon: GraduationCap },
  { value: "teacher", label: "Teachers", icon: BookOpen },
  { value: "admin", label: "Admins", icon: ShieldCheck },
  { value: "department-head", label: "Dept Heads", icon: Building2 },
];

const ROLE_BADGES: Record<string, string> = {
  student: "bg-blue-50 text-blue-700",
  teacher: "bg-purple-50 text-purple-700",
  admin: "bg-amber-50 text-amber-700",
  "department-head": "bg-emerald-50 text-emerald-700",
};

type FormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  studentId: string;
};

const emptyForm: FormData = { name: "", email: "", password: "", role: "student", department: "", studentId: "" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState<"add" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; total: number; results: { row: number; email: string; status: string; error?: string }[] } | null>(null);

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const url = roleFilter === "all" ? "/api/admin/students" : `/api/admin/students?role=${roleFilter}`;
      const data = await apiFetch<{ users: UserData[] }>(url);
      setUsers(data.users || []);
    } catch {}
    setLoading(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await apiFetch(`/api/admin/students/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !current }),
      });
      fetchUsers();
    } catch {}
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingUser(null);
    setError("");
    setShowModal("add");
  };

  const openEdit = (user: UserData) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "",
      studentId: user.studentId || "",
    });
    setEditingUser(user);
    setError("");
    setShowModal("edit");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.email || (!editingUser && !form.password)) {
      setError("Name, email, and password are required");
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role, department: form.department || null, studentId: form.studentId || null };
        if (form.password) body.password = form.password;
        await apiFetch(`/api/admin/students/${editingUser.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/admin/students", {
          method: "POST",
          body: JSON.stringify({ ...form, department: form.department || null, studentId: form.studentId || null }),
        });
      }
      setShowModal(null);
      fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/students/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchUsers();
    } catch {}
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.studentId || "").toLowerCase().includes(q);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-6 md:p-8 max-w-6xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-[22px] font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} users</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowImport(true); setImportFile(null); setImportResult(null); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium border border-border/80 text-foreground hover:bg-muted/50 transition-colors"
          >
            <Upload size={14} />
            Import CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            Add User
          </button>
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex gap-1 mb-5">
        {ROLE_TABS.map((tab) => {
          const active = roleFilter === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11.5px] font-medium transition-all ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {Icon && <Icon size={13} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or ID..."
          className="w-full max-w-md h-9 pl-9 pr-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : filtered.length > 0 ? (
        <div className="bg-white border border-border/80 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Department / ID</th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Joined</th>
                  <th className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold">
                            {u.initials}
                          </div>
                          <div>
                            <div className="text-[12.5px] font-medium text-foreground">{u.name}</div>
                            <div className="text-[11px] text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_BADGES[u.role] || "bg-gray-50 text-gray-700"}`}>
                          {u.role === "department-head" ? "Dept Head" : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[12.5px] text-foreground">{u.department || "—"}</div>
                        {u.studentId && <div className="text-[11px] text-muted-foreground font-mono">{u.studentId}</div>}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">{u.createdAt}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          u.isActive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                        }`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => toggleActive(u.id, u.isActive)} className={`p-1.5 rounded-md transition-colors ${u.isActive ? "hover:bg-red-50 text-red-400" : "hover:bg-green-50 text-green-500"}`} title={u.isActive ? "Deactivate" : "Activate"}>
                            <UserMinus size={13} />
                          </button>
                          {deleteConfirm === u.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Confirm delete">
                                <Check size={13} />
                              </button>
                              <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors" title="Cancel">
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users size={32} className="mb-2 opacity-40" />
          <p className="text-sm">No users found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl border border-border/80 w-full max-w-md mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-semibold text-foreground">
                  {editingUser ? "Edit User" : "Add User"}
                </h2>
                <button onClick={() => setShowModal(null)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              {error && (
                <div className="mb-4 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="text-[11.5px] font-medium text-foreground block mb-1">Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-[11.5px] font-medium text-foreground block mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-[11.5px] font-medium text-foreground block mb-1">Password {editingUser && "(leave blank to keep current)"}</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-[11.5px] font-medium text-foreground block mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, studentId: e.target.value === "student" ? form.studentId : "" })} className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="department-head">Department Head</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11.5px] font-medium text-foreground block mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                {form.role === "student" && (
                  <div>
                    <label className="text-[11.5px] font-medium text-foreground block mb-1">Student ID</label>
                    <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full h-9 px-3 text-[12.5px] rounded-lg border border-border/80 bg-white text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button onClick={() => setShowModal(null)} className="flex-1 h-9 rounded-lg text-[12px] font-medium border border-border/80 text-muted-foreground hover:bg-muted/50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 h-9 rounded-lg text-[12px] font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import CSV Modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => { if (!importing) setShowImport(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl border border-border/80 w-full max-w-lg mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-semibold text-foreground">Import Users from CSV</h2>
                <button onClick={() => { if (!importing) setShowImport(false); }} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground" disabled={importing}>
                  <X size={16} />
                </button>
              </div>

              {importResult ? (
                <div>
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
                    <Check size={18} className="text-green-600 shrink-0" />
                    <div>
                      <div className="text-[13px] font-medium text-green-800">{importResult.imported} users imported</div>
                      <div className="text-[11px] text-green-600">Out of {importResult.total} rows</div>
                    </div>
                  </div>
                  {importResult.results.some((r) => r.status === "skipped") && (
                    <div className="max-h-40 overflow-y-auto space-y-1 mb-4">
                      <div className="text-[11px] font-medium text-muted-foreground mb-1">Skipped rows:</div>
                      {importResult.results.filter((r) => r.status === "skipped").map((r) => (
                        <div key={r.row} className="text-[11px] text-red-600 bg-red-50 px-2.5 py-1 rounded">
                          Row {r.row}: {r.email} — {r.error}
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setShowImport(false); fetchUsers(); }} className="w-full h-9 rounded-lg text-[12px] font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed border-border/80 rounded-lg p-8 text-center mb-4">
                    {importFile ? (
                      <div>
                        <Check size={24} className="mx-auto mb-2 text-green-500" />
                        <p className="text-[12.5px] font-medium text-foreground">{importFile.name}</p>
                        <p className="text-[11px] text-muted-foreground">{(importFile.size / 1024).toFixed(1)} KB</p>
                        <button onClick={() => setImportFile(null)} className="mt-2 text-[11px] text-red-500 hover:underline">Remove</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-[12.5px] font-medium text-foreground">Click to upload CSV file</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Columns: name, email, password, role, department, studentId</p>
                        <input type="file" accept=".csv" className="hidden" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowImport(false)} disabled={importing} className="flex-1 h-9 rounded-lg text-[12px] font-medium border border-border/80 text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-40">
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!importFile) return;
                        setImporting(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", importFile);
                          const token = document.cookie.match(/token=([^;]+)/)?.[1];
                          const res = await fetch("/api/admin/students/import", {
                            method: "POST",
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                            body: formData,
                          });
                          const data = await res.json();
                          setImportResult(data);
                        } catch {
                          setImportResult({ imported: 0, total: 0, results: [{ row: 0, email: "", status: "skipped", error: "Upload failed" }] });
                        }
                        setImporting(false);
                      }}
                      disabled={!importFile || importing}
                      className="flex-1 h-9 rounded-lg text-[12px] font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {importing && <Loader2 size={13} className="animate-spin" />}
                      {importing ? "Importing..." : "Import"}
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <a href="/sample-users.csv" download className="text-[11px] text-primary hover:underline inline-flex items-center gap-1">
                      <Download size={11} />
                      Download sample CSV
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
