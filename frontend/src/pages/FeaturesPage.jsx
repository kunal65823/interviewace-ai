import React from 'react';
import {
  FileText, Mic, BarChart3, Map, FileDown, Sparkles, ShieldCheck, Bell, LayoutDashboard,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const featureSections = [
  {
    icon: FileText,
    title: 'AI Resume Analyzer',
    description: 'Upload a PDF resume and let AI extract skills, projects, education, and technologies automatically.',
    points: [
      'ATS compatibility score out of 100',
      'Strengths & weaknesses breakdown',
      'Missing keyword detection for your target role',
      'Actionable improvement suggestions',
    ],
  },
  {
    icon: Mic,
    title: 'AI Interview Question Generator',
    description: 'Generate realistic interview questions tailored to your role, difficulty, and focus area.',
    points: [
      'Roles: Frontend, Backend, Full Stack, Data Analyst, Software Engineer',
      'Difficulty: Beginner, Intermediate, Advanced',
      'Types: HR, Technical, DSA, Project-Based',
      'Each question includes an expected answer & topic tag',
    ],
  },
  {
    icon: Sparkles,
    title: 'Mock Interviews & AI Feedback',
    description: 'Take timed mock interviews and receive detailed AI-driven performance feedback.',
    points: [
      'Overall, Technical, Communication, Clarity & Confidence scores',
      'Specific improvement suggestions per session',
      'AI-generated sample answers for weak responses',
      'Full session history with revisit capability',
    ],
  },
  {
    icon: Map,
    title: 'Personalized Learning Roadmap',
    description: 'Get a structured, week-by-week plan to reach your target role.',
    points: [
      'Skills to learn, prioritized',
      'Recommended tools & technologies',
      'Suggested portfolio projects',
      'Estimated timeline to job-readiness',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Visualize your progress with charts and key performance cards.',
    points: [
      'Total interviews, average & highest scores',
      'Improvement percentage over time',
      'Score trend charts (Recharts)',
      'Technical & communication performance trends',
    ],
  },
  {
    icon: FileDown,
    title: 'PDF Reports & Notifications',
    description: 'Download professional reports and stay updated via email and in-app notifications.',
    points: [
      'Downloadable PDF with full Q&A and feedback',
      'Email summary after every interview',
      'In-app notification center',
    ],
  },
];

const additional = [
  { icon: LayoutDashboard, title: 'Modern SaaS UI', description: 'Clean, responsive interface with dark and light modes.' },
  { icon: ShieldCheck, title: 'Secure by Design', description: 'Supabase Auth, row-level security, and protected routes throughout.' },
  { icon: Bell, title: 'Real-time Notifications', description: 'Stay informed about completed interviews and new roadmaps.' },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Built for serious interview prep</h1>
        <p className="mt-4 text-muted-foreground">
          Every feature is designed to take you from resume upload to interview-ready, backed by AI feedback at each step.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        {featureSections.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-3">{f.title}</CardTitle>
              <CardDescription>{f.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {additional.map((a) => (
          <div key={a.title} className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <a.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display font-semibold">{a.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
