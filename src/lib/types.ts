export type Role =
  | "student"
  | "admin"
  | "teacher"
  | "department-head";

export type PortalConfig = {
  role: Role;
  label: string;
  description: string;
  icon: string;
  sidebarTheme: "light" | "dark";
  navbarTheme: "light" | "dark";
};

export const PORTAL_CONFIGS: PortalConfig[] = [
  { role: "student", label: "Student Portal", description: "Your campus dashboard", icon: "GraduationCap", sidebarTheme: "light", navbarTheme: "light" },
  { role: "admin", label: "Admin Panel", description: "System administration", icon: "ShieldCheck", sidebarTheme: "dark", navbarTheme: "dark" },
  { role: "teacher", label: "Faculty Portal", description: "Teaching & department", icon: "ChalkboardTeacher", sidebarTheme: "light", navbarTheme: "light" },
  { role: "department-head", label: "Department", description: "Department administration", icon: "Building2", sidebarTheme: "light", navbarTheme: "light" },
];

export type ComplaintStatus = "pending" | "in-review" | "resolved";

export type AnnouncementCategory =
  | "All"
  | "Exams"
  | "Admissions"
  | "Events"
  | "Urgent"
  | "Hostel";

export type AnnouncementPriority = "Urgent" | "Exam" | "Event" | "Hostel" | "Normal";

export type VisibilityType = "global" | "department" | "class";

export interface AnnouncementRecipient {
  recipient_type: "department" | "class" | "student" | "teacher" | "all";
  recipient_id: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  department: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  date: string;
  isRead: boolean;
  createdBy?: string;
  creatorRole?: string;
  targetRoles?: Role[];
  visibilityType?: VisibilityType;
  recipients?: AnnouncementRecipient[];
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  title: string;
  status: ComplaintStatus;
  description: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourceDoc?: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface AIDocument {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: "indexed" | "processing";
}
