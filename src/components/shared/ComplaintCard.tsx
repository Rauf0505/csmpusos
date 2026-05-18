"use client";

import { motion } from "framer-motion";
import { StatusChip } from "./StatusChip";
import { StatusStepper } from "./StatusStepper";
import type { Complaint } from "@/lib/types";

export function ComplaintCard({
  data,
  index = 0,
}: {
  data: Complaint;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className="bg-white border border-border/80 rounded-lg p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-[13px] font-medium text-foreground">
            {data.title}
          </h4>
        </div>
        <StatusChip status={data.status} />
      </div>
      <div className="text-[11px] text-muted-foreground mb-3">
        Submitted {data.createdAt}
      </div>
      <StatusStepper status={data.status} />
    </motion.div>
  );
}
