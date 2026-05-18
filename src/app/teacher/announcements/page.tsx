"use client";

import { motion } from "framer-motion";
import { AnnouncementManager } from "@/components/shared/AnnouncementManager";

export default function TeacherAnnouncements() {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-4xl">
    <AnnouncementManager role="teacher" title="Faculty Announcements" canCreate={true} showOnlyMine={true} />
  </motion.div>;
}
