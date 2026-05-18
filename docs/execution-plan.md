# AI Smart CampusOS — Execution Plan

## System Architecture

```
                    ┌────────────────────────────────────────────┐
                    │              LAYER 1: USERS                │
                    │    Auth · Roles · Permissions · Profiles   │
                    └────────────────┬───────────────────────────┘
                                     │
                    ┌────────────────▼───────────────────────────┐
                    │           LAYER 2: CORE MODULES             │
                    │                                            │
                    │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
                    │  │ Dash │  │ Ann  │  │ Cmpl │  │ AI   │  │
                    │  │board │  │ounce │  │ aint │  │Assist│  │
                    │  └──────┘  └──────┘  └──────┘  └──────┘  │
                    │                                            │
                    │  ┌──────┐  ┌──────┐  ┌──────┐            │
                    │  │Admin │  │ LMS  │  │Anal  │            │
                    │  │Panel │  │Basic │  │ytics │            │
                    │  └──────┘  └──────┘  └──────┘            │
                    └────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (✅ Complete)

### ✅ Layer 1 — Users
- [x] Database setup (SQLite via better-sqlite3)
- [x] User model (id, name, email, password, role, department, etc.)
- [x] Auth API (signup, login, me, logout, seed)
- [x] JWT tokens with bcrypt
- [x] Auth page (login/signup with role selection)
- [x] Middleware (route protection + role redirect)
- [x] PostgreSQL migration file ready for Supabase

### ✅ Layer 2 — Module 1: Central Dashboard
- [x] Student dashboard API + UI
- [x] Admin dashboard API + UI
- [x] Teacher dashboard API + UI
- [x] Department dashboard API + UI
- [x] Loading states + API integration

---

## Phase 2: Announcement + Complaint ✅

### ✅ Module 2: Announcement System
**Dependency:** Layer 1 (Auth) ✅
**Build Priority:** High (UX Step 3)

**API:**
- [x] `GET /api/announcements` — list with filters (category, priority, role)
- [x] `POST /api/announcements` — create (admin/teacher/dept)
- [x] `PUT /api/announcements/:id` — update
- [x] `DELETE /api/announcements/:id` — delete
- [x] `GET /api/announcements/:id` — single detail

**Frontend (Student):**
- [x] Announcement list with filter pills (All, Exams, Events, Urgent)
- [x] Search/filter by category
- [x] Expandable card for details

**Frontend (Admin/Teacher/Dept):**
- [x] Create announcement form
- [x] Manage announcements table

**DB Table:** `announcements` (already exists)

---

### ✅ Module 3: Complaint System
**Dependency:** Layer 1 (Auth) ✅
**Build Priority:** High (UX Step 4)

**API:**
- [x] `GET /api/complaints` — list (student sees own, admin sees all)
- [x] `POST /api/complaints` — create (student)
- [x] `PUT /api/complaints/:id` — update status (admin)
- [x] `GET /api/complaints/:id` — single with status timeline

**Frontend (Student):**
- [x] Complaint submission form (title, category pills, description, attachment)
- [x] My complaints list with status tracking
- [x] Status stepper (Pending → In Review → Resolved)

**Frontend (Admin):**
- [x] All complaints management table
- [x] Status update controls
- [x] Category-wise filtering

**DB Table:** `complaints` (already exists)

---

## Phase 3: AI Assistant + Admin Panel (In Progress)

### ✅ Module 4: Student AI Assistant (RAG)
**Dependency:** Announcement module, Layer 1
**Build Priority:** High (UX Step 5 — WOW feature)

**Backend:**
- [x] `POST /api/ai/chat` — ask question, get answer (keyword-based RAG)
- [x] `POST /api/ai/documents/upload` — admin uploads PDF/TXT
- [x] `GET /api/ai/documents` — list knowledge base docs
- [x] `DELETE /api/ai/documents/:id` — remove doc
- [x] Simple keyword-based Q&A with source citation

**Frontend (Student):**
- [x] Chat interface (two-panel: history + conversation)
- [x] Quick question buttons
- [x] AI response with source citation
- [x] Chat history saved in localStorage
- [x] New conversation support

**Frontend (Admin):**
- [x] Knowledge base manager (upload + list PDFs)
- [x] Document status (processing/indexed)

**DB Table:** `ai_documents` (already exists)

---

### ✅ Module 5: Admin Management Panel
**Dependency:** All previous modules
**Build Priority:** Medium (UX Step 6)

**Features:**
- [x] Announcement CRUD (shared component + dedicated page)
- [x] Complaint management with status updates
- [x] Knowledge base uploader with drag & drop
- [x] Analytics dashboard with live stats
- [x] Student/user management (list, search, activate/deactivate)

---

## Phase 4: Enhancement

### ✅ Module 6: Basic LMS
**Dependency:** Teacher module
**Build Priority:** Low (Master Plan says DO NOT overbuild)

- [x] Course management (API: create, list, update, delete)
- [x] Assignment upload (API: create + list by course)
- [x] Lecture files (placeholder — course detail page)
- [x] Attendance marking (API: mark present/absent/late, with upsert)
- [ ] Basic quiz system (skipped — overbuild per Master Plan)

---

### ✅ Module 7: Analytics & Notifications
**Dependency:** All modules
**Build Priority:** Low

- [x] Real-time notifications (API: create, list, unread count, mark-read)
- [x] Email notifications (API placeholder — ready for SMTP integration)
- [x] Advanced analytics charts (Recharts: PieChart for complaints, BarChart for AI queries)
- [x] Export reports (CSV download for complaints + students)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Next.js API routes |
| Database (local) | SQLite via better-sqlite3 |
| Database (production) | Supabase PostgreSQL |
| Auth | JWT + bcrypt |
| AI | OpenAI API / Local RAG |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel + Supabase |

---

## Database Relationships

```
users ────┬──< complaints
          │
          ├── created_by (announcements)
          │
          └── role-based access

announcements ──── target_roles (comma-separated)

ai_documents ──── extracted_text for RAG
```

---

## Build Commands

```bash
npm run dev          # Start dev server
npm run db:seed      # Seed database with test data
npm run build        # Production build
```

## Test Users

| Email | Password | Role |
|-------|----------|------|
| ali@campus.edu | password123 | student |
| s.ahmed@campus.edu | password123 | admin |
| usman@campus.edu | password123 | teacher |
| ayesha@campus.edu | password123 | department-head |
