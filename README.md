# InterviewAce AI

InterviewAce AI is an AI-powered interview preparation platform that helps students and job seekers prepare for technical and HR interviews. Upload resumes, generate personalized interview questions, take mock interviews, receive AI feedback, track progress, and download professional reports.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Shadcn UI (Radix), React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email + Google OAuth) |
| AI | Google Gemini API |
| Storage | Supabase Storage (resumes & PDF reports) |
| Email | Nodemailer (SMTP) |
| Deployment | Docker, Docker Compose |

## Project Structure

```
interviewace-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase & Gemini client configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth, error handling, upload
│   │   ├── routes/            # Express routers
│   │   ├── services/          # AI services, PDF, email
│   │   ├── utils/              # Helpers (PDF extraction)
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components (Shadcn-style)
│   │   ├── context/            # Auth & Theme context
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/              # Marketing & Dashboard layouts
│   │   ├── lib/                   # Supabase client, API client, utils
│   │   ├── pages/                  # All route pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── database/
│   └── schema.sql            # Full Supabase schema with RLS
├── docker-compose.yml
└── README.md
```

## Features

### Authentication
- Email/password sign up & login
- Google OAuth login
- Forgot/reset password flow
- Protected routes (candidate & admin)
- Editable user profile (target role, skill level, bio)

### Resume Analyzer
- Upload resume PDFs (stored in Supabase Storage)
- AI extraction of skills, projects, education, technologies
- ATS compatibility score (0–100)
- Strengths, weaknesses, missing keywords, suggested improvements

### AI Interview Question Generator
- Roles: Frontend Developer, Backend Developer, Full Stack Developer, Data Analyst, Software Engineer
- Difficulty: Beginner, Intermediate, Advanced
- Types: HR, Technical, DSA, Project-Based
- Each question includes an expected answer and topic

### Mock Interview Module
- Start a timed interview session
- Navigate between questions, save answers in real time
- Submit to trigger AI feedback generation

### AI Feedback Engine
- Overall, Technical, Communication, Clarity, Confidence scores
- Improvement suggestions
- AI-generated sample answers for weak responses
- Auto-generated PDF report + email notification

### Personalized Learning Roadmap
- Select desired role and current skill level
- AI generates: skills to learn, recommended technologies, suggested projects, weekly plan, estimated timeline

### Analytics Dashboard
- Total interviews, average/highest score, improvement %
- Score trend charts (Recharts): overall, technical, communication

### Reports
- List all feedback reports
- Download PDF via signed Supabase Storage URLs

### Admin Panel
- Platform-wide stats: total users, total interviews, average score, daily active users, popular roles
- User list with progress data
- Interview statistics table
- Admin action logs

## Database Schema

See [`database/schema.sql`](./database/schema.sql) for the complete schema, including:

- `profiles`, `resumes`, `resume_analysis`, `interview_questions`, `interview_sessions`, `interview_answers`, `feedback_reports`, `learning_roadmaps`, `user_progress`, `notifications`, `admin_logs`
- Foreign keys, indexes, enums, triggers (auto-create profile on signup)
- Row Level Security (RLS) policies for every table
- Helper `is_admin()` function and admin analytics views

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://ai.google.dev/)
- An SMTP provider (Gmail, SendGrid, Mailtrap, etc.)

### 2. Supabase Setup

1. Create a new Supabase project.
2. Open the SQL Editor and run the contents of `database/schema.sql`.
3. In **Authentication → Providers**, enable **Email** and **Google** providers. For Google, configure OAuth credentials in Google Cloud Console and add the redirect URL Supabase provides.
4. In **Storage**, create two buckets:
   - `resumes` (private)
   - `reports` (private)
5. Copy your Project URL, anon key, and service role key from **Project Settings → API**.

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
# GEMINI_API_KEY, SMTP_* variables, and FRONTEND_URL

npm install
npm run dev   # starts on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_BASE_URL

npm install
npm run dev   # starts on http://localhost:5173
```

### 5. Running with Docker

From the project root:

```bash
# Ensure backend/.env is filled in (used by docker-compose)
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:5000/api

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS & email links |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name (default `gemini-1.5-flash`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Email configuration |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | API rate limiting |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |

## API Overview

All routes are prefixed with `/api`.

| Module | Routes |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/google`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me`, `PUT /auth/profile` |
| Resumes | `POST /resumes/upload`, `GET /resumes`, `GET /resumes/:id/analysis`, `DELETE /resumes/:id` |
| Interviews | `POST /interviews/questions/generate`, `GET /interviews/questions`, `POST /interviews/sessions`, `GET /interviews/sessions`, `GET /interviews/sessions/:id`, `PUT /interviews/sessions/:id/answers/:questionId`, `POST /interviews/sessions/:id/complete` |
| Roadmaps | `POST /roadmaps/generate`, `GET /roadmaps`, `GET /roadmaps/:id` |
| Analytics | `GET /analytics/overview`, `GET /analytics/trends` |
| Reports | `GET /reports`, `GET /reports/:id/download` |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| Admin | `GET /admin/stats`, `GET /admin/users`, `GET /admin/interviews`, `PUT /admin/users/:id/role`, `GET /admin/logs` |

## Security Notes

- All Supabase tables have Row Level Security enabled; users can only access their own data, admins have elevated access via the `is_admin()` helper function.
- The backend uses the Supabase **service role key** only for privileged operations (storage uploads, admin queries); all user-scoped queries use a client authenticated with the user's JWT to enforce RLS.
- File uploads are restricted to PDF, 5MB max.
- API rate limiting is enabled via `express-rate-limit`.

## License

This project is provided as-is for educational and portfolio purposes.
