"use client";

import { motion } from "framer-motion";

export function UserMessage({
  content,
  initials = "AK",
}: {
  content: string;
  initials?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5 items-start flex-row-reverse"
    >
      <div className="w-7 h-7 rounded-full bg-purple-600 shrink-0 flex items-center justify-center text-[11px] font-medium text-white">
        {initials}
      </div>
      <div className="max-w-[75%]">
        <div className="text-[13px] leading-relaxed px-3.5 py-2.5 rounded-lg rounded-tr-[4px] bg-primary text-white">
          {content}
        </div>
      </div>
    </motion.div>
  );
}
