"use client";

import { AnnouncementManager } from "@/components/shared/AnnouncementManager";

export default function AdminAnnouncementsPage() {
  return <AnnouncementManager role="admin" title="All Announcements" canCreate={true} />;
}
