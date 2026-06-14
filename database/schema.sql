-- ============================================================
-- InterviewAce AI - Supabase PostgreSQL Schema
-- ============================================================
-- Run this in Supabase SQL Editor (or via supabase CLI migrations)
-- Assumes Supabase Auth is enabled (auth.users table exists)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
create type user_role as enum ('candidate', 'admin');
create type difficulty_level as enum ('beginner', 'intermediate', 'advanced');
create type question_type as enum ('hr', 'technical', 'dsa', 'project_based');
create type target_role as enum ('frontend_developer', 'backend_developer', 'full_stack_developer', 'data_analyst', 'software_engineer');
create type interview_status as enum ('in_progress', 'completed', 'abandoned');
create type notification_type as enum ('interview_summary', 'system', 'roadmap', 'admin');

-- ============================================================
-- TABLE: profiles
-- Extends auth.users with app-specific data
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role user_role not null default 'candidate',
  current_skill_level difficulty_level default 'beginner',
  target_role target_role,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);

-- ============================================================
-- TABLE: resumes
-- ============================================================
create table resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null, -- Supabase Storage path
  file_size_bytes integer,
  uploaded_at timestamptz not null default now()
);

create index idx_resumes_user_id on resumes(user_id);

-- ============================================================
-- TABLE: resume_analysis
-- ============================================================
create table resume_analysis (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid not null references resumes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  extracted_text text,
  skills text[] default '{}',
  projects jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  technologies text[] default '{}',
  summary text,
  ats_score integer check (ats_score >= 0 and ats_score <= 100),
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  missing_keywords text[] default '{}',
  suggested_improvements text[] default '{}',
  created_at timestamptz not null default now()
);

create index idx_resume_analysis_user_id on resume_analysis(user_id);
create index idx_resume_analysis_resume_id on resume_analysis(resume_id);

-- ============================================================
-- TABLE: interview_questions
-- AI-generated question bank
-- ============================================================
create table interview_questions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  role target_role not null,
  difficulty difficulty_level not null,
  question_type question_type not null,
  question text not null,
  expected_answer text,
  topic text,
  created_at timestamptz not null default now()
);

create index idx_interview_questions_user_id on interview_questions(user_id);
create index idx_interview_questions_role_diff_type on interview_questions(role, difficulty, question_type);

-- ============================================================
-- TABLE: interview_sessions
-- ============================================================
create table interview_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  role target_role not null,
  difficulty difficulty_level not null,
  question_types question_type[] not null,
  status interview_status not null default 'in_progress',
  duration_seconds integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_interview_sessions_user_id on interview_sessions(user_id);
create index idx_interview_sessions_status on interview_sessions(status);

-- ============================================================
-- TABLE: interview_answers
-- Links questions <-> sessions <-> user answers
-- ============================================================
create table interview_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  question_id uuid not null references interview_questions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  answer_text text,
  question_order integer not null,
  time_spent_seconds integer,
  created_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create index idx_interview_answers_session_id on interview_answers(session_id);
create index idx_interview_answers_user_id on interview_answers(user_id);

-- ============================================================
-- TABLE: feedback_reports
-- AI feedback generated post-interview
-- ============================================================
create table feedback_reports (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  overall_score numeric(5,2) check (overall_score >= 0 and overall_score <= 100),
  technical_score numeric(5,2) check (technical_score >= 0 and technical_score <= 100),
  communication_score numeric(5,2) check (communication_score >= 0 and communication_score <= 100),
  clarity_score numeric(5,2) check (clarity_score >= 0 and clarity_score <= 100),
  confidence_score numeric(5,2) check (confidence_score >= 0 and confidence_score <= 100),
  improvement_suggestions text[] default '{}',
  better_sample_answers jsonb default '[]'::jsonb,
  pdf_report_path text,
  created_at timestamptz not null default now()
);

create index idx_feedback_reports_user_id on feedback_reports(user_id);
create index idx_feedback_reports_session_id on feedback_reports(session_id);

-- ============================================================
-- TABLE: learning_roadmaps
-- ============================================================
create table learning_roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  desired_role target_role not null,
  current_skill_level difficulty_level not null,
  skills_to_learn text[] default '{}',
  recommended_technologies text[] default '{}',
  suggested_projects jsonb default '[]'::jsonb,
  weekly_plan jsonb default '[]'::jsonb,
  estimated_timeline_weeks integer,
  created_at timestamptz not null default now()
);

create index idx_learning_roadmaps_user_id on learning_roadmaps(user_id);

-- ============================================================
-- TABLE: user_progress
-- Aggregated/derived progress metrics for analytics
-- ============================================================
create table user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  total_interviews integer not null default 0,
  average_score numeric(5,2) default 0,
  highest_score numeric(5,2) default 0,
  improvement_percentage numeric(5,2) default 0,
  last_interview_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index idx_user_progress_user_id on user_progress(user_id);

-- ============================================================
-- TABLE: notifications
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_is_read on notifications(is_read);

-- ============================================================
-- TABLE: admin_logs
-- ============================================================
create table admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_admin_logs_admin_id on admin_logs(admin_id);
create index idx_admin_logs_created_at on admin_logs(created_at);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    'candidate'
  );

  insert into public.user_progress (user_id) values (new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at maintenance
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table resumes enable row level security;
alter table resume_analysis enable row level security;
alter table interview_questions enable row level security;
alter table interview_sessions enable row level security;
alter table interview_answers enable row level security;
alter table feedback_reports enable row level security;
alter table learning_roadmaps enable row level security;
alter table user_progress enable row level security;
alter table notifications enable row level security;
alter table admin_logs enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ---------- profiles ----------
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id or is_admin());

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ---------- resumes ----------
create policy "Users manage own resumes"
  on resumes for all using (auth.uid() = user_id or is_admin());

-- ---------- resume_analysis ----------
create policy "Users manage own resume analysis"
  on resume_analysis for all using (auth.uid() = user_id or is_admin());

-- ---------- interview_questions ----------
create policy "Users view own and global questions"
  on interview_questions for select
  using (user_id is null or auth.uid() = user_id or is_admin());

create policy "Users insert own questions"
  on interview_questions for insert
  with check (auth.uid() = user_id);

-- ---------- interview_sessions ----------
create policy "Users manage own sessions"
  on interview_sessions for all using (auth.uid() = user_id or is_admin());

-- ---------- interview_answers ----------
create policy "Users manage own answers"
  on interview_answers for all using (auth.uid() = user_id or is_admin());

-- ---------- feedback_reports ----------
create policy "Users manage own feedback reports"
  on feedback_reports for all using (auth.uid() = user_id or is_admin());

-- ---------- learning_roadmaps ----------
create policy "Users manage own roadmaps"
  on learning_roadmaps for all using (auth.uid() = user_id or is_admin());

-- ---------- user_progress ----------
create policy "Users view own progress"
  on user_progress for select using (auth.uid() = user_id or is_admin());

create policy "System updates progress"
  on user_progress for update using (auth.uid() = user_id or is_admin());

-- ---------- notifications ----------
create policy "Users manage own notifications"
  on notifications for all using (auth.uid() = user_id or is_admin());

-- ---------- admin_logs ----------
create policy "Only admins access logs"
  on admin_logs for all using (is_admin());

-- ============================================================
-- VIEWS for Admin Analytics
-- ============================================================
create or replace view admin_platform_stats as
select
  (select count(*) from profiles where role = 'candidate') as total_users,
  (select count(*) from interview_sessions) as total_interviews,
  (select round(avg(overall_score),2) from feedback_reports) as average_platform_score,
  (select count(*) from interview_sessions where started_at >= current_date) as daily_active_sessions;

create or replace view admin_popular_roles as
select role, count(*) as session_count
from interview_sessions
group by role
order by session_count desc;
