-- ============================================================
-- PostgreSQL Migration Queries
-- For Supabase deployment after local development
-- Run this file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'department-head')),
  department VARCHAR(255),
  student_id VARCHAR(100) UNIQUE,
  initials VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- COMPLAINTS TABLE
-- ============================================================
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Hostel', 'Internet', 'Fee', 'Teacher', 'Transport', 'Cafeteria')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'resolved')),
  description TEXT NOT NULL,
  attachment VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);

-- ============================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  department VARCHAR(255),
  category VARCHAR(50) DEFAULT 'All' CHECK (category IN ('All', 'Exams', 'Admissions', 'Events', 'Urgent', 'Hostel')),
  priority VARCHAR(50) DEFAULT 'Normal' CHECK (priority IN ('Urgent', 'Exam', 'Event', 'Hostel', 'Normal')),
  target_roles VARCHAR(255), -- comma-separated: "student,teacher"
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

-- ============================================================
-- AI DOCUMENTS TABLE
-- ============================================================
CREATE TABLE ai_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500),
  file_size VARCHAR(50),
  extracted_text TEXT,
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'indexed')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO users (name, email, password, role, student_id, initials) VALUES
  ('Ali Khan', 'ali@campus.edu', crypt('password123', gen_salt('bf')), 'student', 'CS-001', 'AK'),
  ('Dr. S. Ahmed', 's.ahmed@campus.edu', crypt('password123', gen_salt('bf')), 'admin', NULL, 'SA'),
  ('Prof. Usman', 'usman@campus.edu', crypt('password123', gen_salt('bf')), 'teacher', NULL, 'PU'),
  ('Dr. Ayesha', 'ayesha@campus.edu', crypt('password123', gen_salt('bf')), 'department-head', NULL, 'DA');
