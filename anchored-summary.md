```
## Goal
- Build an AI Smart CampusOS layer by layer with real database integration, fully optimized with 4 core roles.

## Constraints & Preferences
- Work in Roman Urdu
- Local SQLite database now, PostgreSQL migration file ready
- Tech stack: Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, Lucide
- AI uses Gemini via Google Generative AI SDK
- Agentic RAG: document retrieval → LLM context injection → sourced answers
- All user data, chat sessions, notifications stored in DB only — zero localStorage, zero hardcoded mock users

## Progress
### Done
- Layer 1 complete: Auth (JWT + bcrypt), SQLite DB, Middleware, Seed data, 4 dashboards
- Module 2 (Announcements): API CRUD + filters, student list, admin manager, role targeting
- Module 3 (Complaints): API create/list/update, student form, admin table with status
- Module 4 (AI Assistant): Gemini Agentic RAG, document upload/delete, chat UI with DB-persisted sessions
- Module 5 (Admin Panel): analytics, announcements, user management (full CRUD all roles), AI knowledge base
- Module 6 (Basic LMS): courses, assignments, attendance APIs + teacher page
- Module 7 (Analytics & Notifications): Recharts pie/bar charts, CSV export, notifications API + real-time bell icon
- **User Management**: Admin can add/edit/delete/activate-deactivate users (student, teacher, admin, department-head)
- **Bulk CSV Import**: `POST /api/admin/students/import` with validation, transaction, result reporting
- **Logout**: UserMenu component on all navbars — click avatar → dropdown → "Sign out" clears cookie
- **Notifications**: NotificationBell component fetches `/api/notifications?unread=true` every 30 seconds, shows real count
- **Markdown Rendering**: AiMessage uses react-markdown + remark-gfm for formatted AI responses
- **Timetable + Settings**: Placeholder pages at `/student/timetable`, `/student/settings` — sidebar links fixed
- **AnnouncementManager**: Full CRUD — admin can edit/delete any announcement, "department-head" added to target audience options
- **All Sidebar Placeholders**: `/teacher/marks`, `/teacher/timetable`, `/teacher/settings`, `/department/faculty`, `/department/courses`, `/department/reports`, `/department/settings` — all with Phase 2 banners, no broken `#` links
- **Dynamic Faculty Page**: `/department/faculty` fetches from `/api/department/faculty` — returns teachers filtered by the HOD's department from JWT `department` field
- **JWT `department`**: Added to payload in login/signup routes, exposed via `UserInfo` type and `getUserFromToken()`
- **Sidebar Configs**: All 7 broken `#` links replaced with real paths
- **Hydration Fix**: Navbars read JWT in `useEffect`, server/client mismatch resolved
- **LocalStorage removed**: `localStorage.getItem("token")` fallbacks removed from api.ts, login page, dashboard export, AI knowledge upload

### In Progress
- (none)

### Blocked
- Gemini API quota exhausted (429) — user needs to enable billing on Google Cloud project

## Key Decisions
- Replaced `openai` npm package with `@google/generative-ai` SDK for Gemini API
- Removed 6 unused roles to keep only 4 core roles: student, admin, teacher, department-head
- Created `getUserFromToken()` utility to read user info from JWT cookie instead of localStorage/mock data
- Changed API `/api/ai/chat` to accept `sessionId` and persist all messages to DB transactionally
- Used DB transaction for CSV import (all-or-nothing), pre-hash passwords before transaction
- Student ID field hidden in user form when role ≠ "student", cleared on role change
- Department field added to JWT payload for per-department filtering in faculty page and future queries

## Next Steps
- Seed more realistic data for testing (multiple departments, more teachers/students)
- Phase 2: full implementation of marks entry, timetable, courses, reports modules
- Quiz/exam module, fee management, hostel management
- PostgreSQL migration (migration file already exists)
- Enable Gemini billing to resolve 429 errors

## Critical Context
- Build passes with `npx next build` — 51 pages, zero errors (was 44 pages before adding 7 placeholder pages)
- Stale `.next/cache` causes `Cannot find module './vendor-chunks/...'` errors after package installs; needs `rm -rf .next && npm run dev`
- Gemini API key in `.env.local` is valid but free tier daily quota exhausted
- 4 test users: ali@campus.edu / s.ahmed@campus.edu / usman@campus.edu / ayesha@campus.edu, all with password "password123"
- Sample CSV for bulk import at `/sample-users.csv`
- All user data in DB — no localStorage, no mockUser/mockAdmin, no hardcoded profiles
- Department heads see only their own department's teachers on the Faculty page

## Relevant Files
- src/app/admin/users/page.tsx: user management UI with full CRUD + CSV import modal
- src/app/api/admin/students/import/route.ts: bulk CSV import endpoint with validation + transaction
- src/components/shared/UserMenu.tsx: profile dropdown with Sign out button
- src/components/shared/NotificationBell.tsx: real-time notification count fetcher
- src/components/shared/AiMessage.tsx: markdown rendering with react-markdown
- src/components/shared/AnnouncementManager.tsx: full CRUD with edit/delete + department-head target
- src/components/shared/PortalSidebarConfigs.tsx: all sidebar links now point to real pages
- src/lib/user.ts: getUserFromToken() utility (JWT cookie → user info with department)
- src/lib/auth.ts: verifyActiveToken() — checks is_active in DB, JwtPayload includes department
- src/middleware.ts: fixed department-head → /department prefix mapping
- src/app/api/auth/login/route.ts: signToken() now includes department in JWT
- src/app/api/department/faculty/route.ts: returns teachers filtered by HOD's department
- src/app/department/faculty/page.tsx: dynamic faculty listing page
- public/sample-users.csv: downloadable template for CSV import
- 7 new placeholder pages: teacher/marks, teacher/timetable, teacher/settings, department/faculty, department/courses, department/reports, department/settings
```
