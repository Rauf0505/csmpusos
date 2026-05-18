"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  accent: "blue" | "amber" | "purple" | "cyan";
  icon?: React.ReactNode;
}

const accentColors = {
  blue: { bg: "#eff6ff", iconColor: "#2563eb" },
  amber: { bg: "#fef3c7", iconColor: "#d97706" },
  purple: { bg: "#f3e8ff", iconColor: "#7c3aed" },
  cyan: { bg: "#cffafe", iconColor: "#0891b2" },
};

export function StatCard({ label, value, change, accent, icon }: StatCardProps) {
  const colors = accentColors[accent];

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-white border border-border/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] rounded-xl p-5 cursor-default transition-all flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: colors.bg, color: colors.iconColor }}>
          {icon}
        </div>
        {change && (
          <div className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ backgroundColor: colors.bg, color: colors.iconColor }}>
            {change}
          </div>
        )}
      </div>
      <div>
        <div className="text-[12px] text-muted-foreground font-medium mb-0.5">{label}</div>
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      </div>
    </motion.div>
  );
}
