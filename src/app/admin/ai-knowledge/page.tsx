"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetch } from "@/lib/api";
import type { AIDocument } from "@/lib/types";
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Loader2,
  FileStack,
  Clock,
} from "lucide-react";

export default function AIKnowledgePage() {
  const [documents, setDocuments] = useState<AIDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [hoveredDoc, setHoveredDoc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await apiFetch<{ documents: AIDocument[] }>("/api/ai/documents");
      setDocuments(data.documents || []);
    } catch {}
    setLoading(false);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      const res = await fetch("/api/ai/documents", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) fetchDocuments();
    } catch {}
    setUploading(false);
  };

  const deleteDoc = async (id: string) => {
    try {
      await apiFetch(`/api/ai/documents/${id}`, { method: "DELETE" });
      fetchDocuments();
    } catch {}
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-6 md:p-8 max-w-5xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-[22px] font-semibold text-foreground">
            AI Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload documents that the AI uses to answer student questions
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Upload zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: dragOver ? "#2563eb" : "rgba(0,0,0,0.08)",
          background: dragOver ? "rgba(37,99,235,0.04)" : "#ffffff",
        }}
        className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer mb-8 transition-colors hover:border-primary/40"
        style={{ background: dragOver ? "rgba(37,99,235,0.04)" : "#ffffff" }}
      >
        <motion.div
          animate={{ scale: dragOver ? 1.1 : 1 }}
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-3"
        >
          <Upload size={24} className={dragOver ? "text-primary" : "text-muted-foreground"} />
        </motion.div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          Drop documents here
        </h3>
        <p className="text-xs text-muted-foreground">
          or click to browse · PDF, DOCX, TXT up to 10MB
        </p>
      </motion.div>

      {/* Status bar */}
      <div className="flex items-center gap-3 mb-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileStack size={14} />
          <span>Knowledge base: {documents.length} documents</span>
        </div>
        {documents.length > 0 && (
          <>
            <span className="text-border/60">·</span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>Last updated: {documents[0]?.uploadDate}</span>
            </div>
          </>
        )}
      </div>

      {/* Document grid */}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onMouseEnter={() => setHoveredDoc(doc.id)}
                onMouseLeave={() => setHoveredDoc(null)}
                className="bg-white border border-border/80 rounded-lg p-4 relative group"
              >
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-foreground truncate">
                      {doc.fileName}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {doc.fileSize} · Uploaded {doc.uploadDate}
                    </div>
                    <div className="mt-1.5">
                      {doc.status === "indexed" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} />
                          Indexed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Loader2 size={10} className="animate-spin" />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {hoveredDoc === doc.id && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => deleteDoc(doc.id)}
                        className="shrink-0 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={<FileStack size={24} />}
          title="No documents uploaded"
          desc="Upload documents to build your AI knowledge base"
        />
      )}
    </motion.div>
  );
}
