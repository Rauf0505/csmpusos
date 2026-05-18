# Layer 1 — USERS

## Core Concept

Ye layer system ki foundation hai. Har cheez user se start hoti hai.

## Who Uses the System?

### 1. Students
- **Need**: information, announcements, help, complaints, schedules, support
- **Flow**: Login → Dashboard → Ask AI → Check notices → Submit complaint → Track response → Logout
- **Pain point**: University info scattered, no central place

### 2. Teachers
- **Need**: course management, attendance, announcements, assignment handling, communication
- **Flow**: Login → Manage courses → Upload material → Mark attendance → Respond to students
- **Pain point**: Manual processes, no digital workflow

### 3. Administration
- **Need**: centralized control, complaint management, student communication, analytics, departmental coordination
- **Flow**: Login → View dashboard → Manage announcements → Monitor complaints → Assign departments → Review analytics
- **Pain point**: No oversight, no tracking

### 4. Departments
- **Need**: ticket handling, notices, workflows, student interaction
- **Flow**: Login → View assigned tickets → Respond → Update status → Post department notices
- **Pain point**: No structured ticketing

---

## Role Hierarchy

```
                    ┌─────────────────┐
                    │  Authentication  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Role Select   │
                    └──┬──┬────┬──┬──┘
                       │  │    │  │
              ┌────────┘  │    │  └──────────┐
              ▼           ▼    ▼             ▼
         Student      Teacher  Admin     Department
                                               Head
```

---

## Database Schema (Layer 1)

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (CUID) | Primary key |
| name | varchar | Full name |
| email | varchar (unique) | Login email |
| password | varchar (hashed) | bcrypt hash |
| role | enum | student, teacher, admin, department-head |
| department | varchar? | Department name (for teachers/dept heads) |
| studentId | varchar? | Roll number (for students) |
| initials | varchar? | Auto-generated from name |
| isActive | boolean | Account status |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

## Authentication Flow

```
1. User visits /auth
2. Enters email + password + selects role
3. POST /api/auth/login
4. Server validates credentials
5. Returns JWT token + user data
6. Frontend stores token in localStorage
7. Redirects to role-specific dashboard
```

### JWT Token Payload
```json
{
  "id": "user-id",
  "email": "user@campus.edu",
  "role": "student",
  "name": "Ali Khan"
}
```

---

## API Routes (Layer 1)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | /api/auth/signup | Create new user |
| POST | /api/auth/login | Authenticate user |
| GET | /api/auth/me | Get current user from token |
| POST | /api/auth/logout | Clear session |

---

## Seed Data (for testing)

| Name | Email | Role | Password |
|------|-------|------|----------|
| Ali Khan | ali@campus.edu | student | password123 |
| Dr. S. Ahmed | s.ahmed@campus.edu | admin | password123 |
| Prof. Usman | usman@campus.edu | teacher | password123 |
| Dr. Ayesha | ayesha@campus.edu | department-head | password123 |

---

## Security Rules
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Role-based redirect (student cannot access admin routes)
- Middleware checks token on protected routes

---

## Next Layer (Layer 2)
Layer 2 will add: Dashboard, Announcements, Complaints, AI Assistant, and Admin Panel modules.
