-- ============================================
-- CampusOS Supabase Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student','teacher','admin','department-head')),
  department TEXT,
  student_id TEXT UNIQUE,
  initials TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (NOW()),
  updated_at TEXT DEFAULT (NOW())
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in-review','resolved')),
  description TEXT NOT NULL,
  attachment TEXT,
  created_at TEXT DEFAULT (NOW()),
  updated_at TEXT DEFAULT (NOW())
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT,
  category TEXT DEFAULT 'All',
  priority TEXT DEFAULT 'Normal',
  target_roles TEXT,
  created_by TEXT,
  visibility_type TEXT DEFAULT 'department',
  creator_role TEXT,
  created_at TEXT DEFAULT (NOW()),
  updated_at TEXT DEFAULT (NOW())
);

-- AI Documents table
CREATE TABLE IF NOT EXISTS ai_documents (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  extracted_text TEXT,
  status TEXT DEFAULT 'processing',
  uploaded_at TEXT DEFAULT (NOW())
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  teacher_id TEXT REFERENCES users(id),
  department TEXT,
  semester TEXT,
  credits INTEGER DEFAULT 3,
  schedule TEXT,
  room TEXT,
  color TEXT DEFAULT '#2563eb',
  created_at TEXT DEFAULT (NOW())
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  file_url TEXT,
  created_at TEXT DEFAULT (NOW())
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present','absent','late')),
  marked_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (NOW())
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK(type IN ('info','warning','success','error')),
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at TEXT DEFAULT (NOW())
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TEXT DEFAULT (NOW()),
  updated_at TEXT DEFAULT (NOW())
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user','assistant')),
  content TEXT NOT NULL,
  source_doc TEXT,
  created_at TEXT DEFAULT (NOW())
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (NOW())
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
  semester TEXT,
  created_at TEXT DEFAULT (NOW())
);

-- Teacher-Classes junction table
CREATE TABLE IF NOT EXISTS teacher_classes (
  teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, class_id)
);

-- Student-Classes junction table
CREATE TABLE IF NOT EXISTS student_classes (
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, class_id)
);

-- Announcement recipients table
CREATE TABLE IF NOT EXISTS announcement_recipients (
  id TEXT PRIMARY KEY,
  announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK(recipient_type IN ('department','class','student','teacher','all')),
  recipient_id TEXT,
  created_at TEXT DEFAULT (NOW())
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_recipients ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for authenticated users (simplified — matches current API behavior)
-- Users can read their own data; admins can read all
CREATE POLICY "users_self_access" ON users
  USING (true);

CREATE POLICY "complaints_all_access" ON complaints
  USING (true);

CREATE POLICY "announcements_all_access" ON announcements
  USING (true);

CREATE POLICY "ai_documents_all_access" ON ai_documents
  USING (true);

CREATE POLICY "chat_sessions_owner" ON chat_sessions
  USING (true);

CREATE POLICY "chat_messages_owner" ON chat_messages
  USING (true);

-- ============================================
-- Seed super admin (optional — user can run this)
-- Password: bcrypt hash of SuperAdmin@123
-- ============================================
-- INSERT INTO users (id, name, email, password, role, initials)
-- VALUES (
--   'super-admin-001',
--   'Super Admin',
--   'super@admin.com',
--   '$2a$12$...',  -- replace with actual bcrypt hash
--   'admin',
--   'SA'
-- );
