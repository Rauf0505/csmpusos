"use client";

import { motion } from "framer-motion";
import type { ComplaintStatus } from "@/lib/types";
import { Check, Eye, Circle } from "lucide-react";

interface StepConfig {
  key: ComplaintStatus;
  label: string;
  icon: React.ReactNode;
}

const steps: StepConfig[] = [
  { key: "pending", label: "Submitted", icon: <Check size={14} /> },
  { key: "in-review", label: "In Review", icon: <Eye size={14} /> },
  { key: "resolved", label: "Resolved", icon: <Circle size={14} /> },
];

const stepOrder: ComplaintStatus[] = ["pending", "in-review", "resolved"];

export function StatusStepper({ status }: { status: ComplaintStatus }) {
  const currentIndex = stepOrder.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <motion.div
                layout
                animate={
                  isCurrent
                    ? { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } }
                    : { scale: 1 }
                }
                style={{
                  background: isCompleted ? (isCurrent ? "#2563eb" : "#f0fdf4") : "#f1f5f9",
                  color: isCompleted ? (isCurrent ? "#ffffff" : "#166534") : "#94a3b8",
                  border: isCurrent ? "2px solid #2563eb" : "none",
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              >
                {step.icon}
              </motion.div>
              <span
                style={{
                  color: isCompleted ? (isCurrent ? "#2563eb" : "#166534") : "#94a3b8",
                  fontWeight: isCurrent ? 500 : 400,
                }}
                className="text-[10px] hidden sm:inline"
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  background: i < currentIndex ? "#2563eb" : "#e2e8f0",
                }}
                className="h-[2px] flex-1 mx-2"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
