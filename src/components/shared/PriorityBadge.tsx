import type { AnnouncementPriority } from "@/lib/types";

const priorityConfig: Record<
  AnnouncementPriority,
  { bg: string; text: string }
> = {
  Urgent: { bg: "#fef2f2", text: "#b91c1c" },
  Exam: { bg: "#eff6ff", text: "#1d4ed8" },
  Event: { bg: "#f0fdf4", text: "#166534" },
  Hostel: { bg: "#fef9c3", text: "#a16207" },
  Normal: { bg: "#f1f5f9", text: "#64748b" },
};

export function PriorityBadge({
  priority,
}: {
  priority: AnnouncementPriority;
}) {
  const config = priorityConfig[priority] || priorityConfig.Normal;
  return (
    <span
      style={{ background: config.bg, color: config.text }}
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-none"
    >
      {priority}
    </span>
  );
}
