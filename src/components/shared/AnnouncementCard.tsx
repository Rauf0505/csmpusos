"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PriorityBadge } from "./PriorityBadge";
import type { Announcement } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

export function AnnouncementCard({
  data,
  index,
}: {
  data: Announcement;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      style={{
        borderLeft: data.priority === "Urgent" ? "3px solid #b91c1c" : "3px solid transparent",
      }}
      className="bg-white border border-border/80 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <PriorityBadge priority={data.priority} />
            <span className="text-[11px] text-muted-foreground">
              {data.department} · {data.date}
            </span>
          </div>
          <h3 className="text-[14px] font-medium text-foreground leading-snug mb-1">
            {data.title}
          </h3>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2">
            {data.description}
          </p>
        </div>
        <button
          className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border/60">
              <p className="text-[13px] text-foreground/80 leading-relaxed">
                {data.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
