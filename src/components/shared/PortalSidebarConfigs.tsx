import {
  LayoutDashboard,
  Speaker,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Users,
  Settings,
  CalendarCheck,
  FileText,
} from "lucide-react";
import type { Role } from "@/lib/types";
import type { SidebarItem } from "./PortalSidebar";

export const portalSidebarItems: Record<Role, SidebarItem[]> = {
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/student/ai", label: "AI Assistant", icon: <GraduationCap size={16} /> },
    { href: "/student/announcements", label: "Announcements", icon: <Speaker size={16} /> },
    { href: "/student/complaints", label: "Complaints", icon: <FileText size={16} /> },
    { href: "/student/timetable", label: "Timetable", icon: <CalendarCheck size={16} /> },
    { href: "/student/settings", label: "Settings", icon: <Settings size={16} /> },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Analytics", icon: <LayoutDashboard size={16} /> },
    { href: "/admin/announcements", label: "Announcements", icon: <Speaker size={16} /> },
    { href: "/admin/complaints", label: "Complaints", icon: <FileText size={16} /> },
    { href: "/admin/ai-knowledge", label: "AI Knowledge", icon: <BookOpen size={16} /> },
    { href: "/admin/users", label: "Users", icon: <Users size={16} /> },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/teacher/courses", label: "My Courses", icon: <BookOpen size={16} /> },
    { href: "/teacher/marks", label: "Mark Entry", icon: <ClipboardList size={16} /> },
    { href: "/teacher/announcements", label: "Announcements", icon: <Speaker size={16} /> },
    { href: "/teacher/timetable", label: "Timetable", icon: <CalendarCheck size={16} /> },
    { href: "/teacher/settings", label: "Settings", icon: <Settings size={16} /> },
  ],
  "department-head": [
    { href: "/department/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/department/faculty", label: "Faculty", icon: <Users size={16} /> },
    { href: "/department/courses", label: "Courses", icon: <BookOpen size={16} /> },
    { href: "/department/announcements", label: "Announcements", icon: <Speaker size={16} /> },
    { href: "/department/reports", label: "Reports", icon: <FileText size={16} /> },
    { href: "/department/settings", label: "Settings", icon: <Settings size={16} /> },
  ],
};
