"use client";

import type { ComplaintStatus } from "@/lib/types";
import { motion } from "framer-motion";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; bg: string; text: string }
> = {
  pending: {
    label: "Pending",
    bg: "#fef9c3",
    text: "#a16207",
  },
  "in-review": {
    label: "In Review",
    bg: "#eff6ff",
    text: "#1d4ed8",
  },
  resolved: {
    label: "Resolved",
    bg: "#f0fdf4",
    text: "#166534",
  },
};

export function StatusChip({ status }: { status: ComplaintStatus }) {
  const config = statusConfig[status];
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        background: config.bg,
        color: config.text,
      }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      {config.label}
    </motion.span>
  );
}
