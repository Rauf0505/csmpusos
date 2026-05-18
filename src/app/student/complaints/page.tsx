"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComplaintCard } from "@/components/shared/ComplaintCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetch } from "@/lib/api";
import type { ComplaintStatus } from "@/lib/types";
import { MessageSquare, Upload, CheckCircle2, X, FileType } from "lucide-react";

interface ComplaintData {
  id: string;
  userId: string;
  userName: string;
  title: string;
  status: string;
  description: string;
  attachment: string | null;
  createdAt: string;
}

export default function ComplaintsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myComplaints, setMyComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch<{ complaints: ComplaintData[] }>("/api/complaints")
      .then((data) => setMyComplaints(data.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!title || !description) return;
    setUploading(true);
    try {
      let attachmentUrl: string | null = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await apiFetch<{ url: string }>("/api/upload", {
          method: "POST",
          body: formData,
        });
        attachmentUrl = uploadRes.url;
      }

      await apiFetch("/api/complaints", {
        method: "POST",
        body: JSON.stringify({ title, description, attachment: attachmentUrl }),
      });
      setSubmitted(true);
      setTitle("");
      setDescription("");
      setFile(null);
      const data = await apiFetch<{ complaints: ComplaintData[] }>("/api/complaints");
      setMyComplaints(data.complaints || []);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {}
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-6 md:p-8 max-w-6xl"
    >
      <h1 className="font-heading text-[22px] font-semibold text-foreground mb-1">
        Complaint System
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Submit and track your complaints
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left — Submit form */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-border/80 rounded-xl p-6"
        >
          <h2 className="text-base font-medium text-foreground mb-1">
            Submit a complaint
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            All complaints are reviewed within 48 hours.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your issue..."
                className="w-full h-10 px-3.5 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Attachment <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center gap-2 border border-border/80 rounded-lg px-3.5 py-2.5 bg-background">
                  <FileType size={16} className="text-muted-foreground shrink-0" />
                  <span className="text-[12.5px] text-foreground truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="p-0.5 rounded hover:bg-muted transition-colors"
                  >
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border/80 rounded-lg p-5 text-center cursor-pointer hover:border-primary/40 hover:bg-blue-50/30 transition-all"
                >
                  <Upload size={20} className="mx-auto text-muted-foreground mb-1.5" />
                  <div className="text-[11.5px] text-muted-foreground">Click to upload or drag here</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">Image, Video, or PDF up to 10MB</div>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!title || !description || uploading}
              className="w-full h-10 bg-primary text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Submit complaint"}
            </button>
          </div>

          {/* Success toast */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-4 py-2.5 rounded-lg border border-green-200"
              >
                <CheckCircle2 size={14} />
                Complaint submitted successfully! Track it below.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right — My complaints */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-medium text-foreground mb-4">
            My complaints
          </h2>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : myComplaints.length > 0 ? (
            <div className="space-y-3">
              {myComplaints.map((c, i) => (
                <ComplaintCard
                  key={c.id}
                  data={{
                    id: c.id,
                    userId: c.userId,
                    userName: c.userName,
                    title: c.title,
                    status: c.status as ComplaintStatus,
                    description: c.description,
                    createdAt: c.createdAt,
                    updatedAt: c.createdAt,
                  }}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquare size={24} />}
              title="No complaints yet"
              desc="Submit your first complaint using the form"
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
