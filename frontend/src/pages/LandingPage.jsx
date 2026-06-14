import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Mic,
  BarChart3,
  Map,
  FileDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import InterviewTranscriptHero from '@/components/InterviewTranscriptHero';

const features = [
  {
    icon: FileText,
    title: 'AI Resume Analyzer',
    description: 'Upload your resume and get an instant ATS score, skill extraction, and tailored improvement suggestions.',
  },
  {
    icon: Mic,
    title: 'Mock Interviews',
    description: 'Practice with AI-generated HR, technical, DSA, and project-based questions tailored to your role and level.',
  },
  {
    icon: Sparkles,
    title: 'Instant AI Feedback',
    description: 'Receive scores on technical depth, communication, clarity, and confidence — with sample answers.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your score trends over time with visual dashboards and identify exactly where to improve.',
  },
  {
    icon: Map,
    title: 'Personalized Roadmaps',
    description: 'Get a week-by-week learning plan with skills, technologies, and projects tailored to your target role.',
  },
  {
    icon: FileDown,
    title: 'Downloadable Reports',
    description: 'Export professional PDF reports of every mock interview to track and share your progress.',
  },
];

const steps = [
  { step: '01', title: 'Upload Your Resume', description: 'Our AI extracts your skills, projects, and experience to personalize your prep journey.' },
  { step: '02', title: 'Choose Your Interview', description: 'Pick a role, difficulty level, and question types — HR, technical, DSA, or project-based.' },
  { step: '03', title: 'Take the Mock Interview', description: 'Answer AI-generated questions in a realistic, timed interview environment.' },
  { step: '04', title: 'Get AI Feedback & Roadmap', description: 'Receive detailed scoring, improvement tips, and a personalized learning plan.' },
];

const testimonials = [
  {
    name: 'Aditi Sharma',
    role: 'Final Year CS Student',
    quote: 'The mock interviews felt incredibly realistic. The feedback on my communication score helped me fix habits I didn\'t even know I had.',
  },
  {
    name: 'Rohan Mehta',
    role: 'Backend Developer, hired at a startup',
    quote: 'I used the resume analyzer before applying and my ATS score jumped from 58 to 89. Landed three interviews within two weeks.',
  },
  {
    name: 'Priya Nair',
    role: 'Data Analyst Aspirant',
    quote: 'The learning roadmap gave me a clear week-by-week plan. I finally stopped jumping between random tutorials.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['3 mock interviews / month', 'Basic resume analysis', 'Score tracking', 'Community support'],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/ month',
    description: 'For serious interview prep',
    features: ['Unlimited mock interviews', 'Advanced resume analysis + ATS score', 'Full analytics dashboard', 'Personalized learning roadmaps', 'PDF report downloads', 'Priority email support'],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Campus',
    price: 'Custom',
    period: 'for institutions',
    description: 'For colleges & bootcamps',
    features: ['Everything in Pro', 'Admin dashboard & analytics', 'Bulk student accounts', 'Usage reporting', 'Dedicated onboarding'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    q: 'Is InterviewAce AI free to use?',
    a: 'Yes! Our Free plan gives you 3 mock interviews per month, basic resume analysis, and score tracking — no credit card required.',
  },
  {
    q: 'What roles and difficulty levels are supported?',
    a: 'We support Frontend Developer, Backend Developer, Full Stack Developer, Data Analyst, and Software Engineer roles across Beginner, Intermediate, and Advanced difficulty levels.',
  },
  {
    q: 'How does the AI feedback work?',
    a: 'After each mock interview, our AI analyzes your answers against expected answer guidance and generates scores for technical accuracy, communication, clarity, and confidence — plus actionable suggestions.',
  },
  {
    q: 'Can I download my interview reports?',
    a: 'Yes, every completed mock interview generates a professional PDF report with your questions, answers, scores, and feedback that you can download anytime.',
  },
  {
    q: 'Do you support Google sign-in?',
    a: 'Yes, you can sign up and log in using your Google account for faster access.',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border grid-bg">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-signal" />
              Powered by Gemini AI
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Ace Your Next <span className="text-gradient">Technical Interview</span> with AI
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Upload your resume, generate role-specific interview questions, practice mock interviews,
              and get instant AI feedback with personalized learning roadmaps — all in one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Start Practicing Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Free forever plan
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <InterviewTranscriptHero />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to prepare</h2>
          <p className="mt-4 text-muted-foreground">
            A complete toolkit covering resume analysis, mock interviews, AI feedback, and structured learning plans.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="transition-transform hover:-translate-y-1 hover:border-primary/40">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground">From resume upload to a personalized roadmap — in four simple steps.</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <span className="font-mono text-4xl font-bold text-primary/20">{s.step}</span>
                <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Loved by students & job seekers</h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-6">
                <div className="flex gap-1 text-amber">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free, upgrade when you're ready for unlimited practice.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={plan.highlighted ? 'border-primary glow-signal' : ''}>
                <CardHeader>
                  {plan.highlighted && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                      Most Popular
                    </span>
                  )}
                  <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant={plan.highlighted ? 'default' : 'outline'} asChild>
                    <Link to="/register">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-20 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer items-center justify-between font-display font-semibold">
                {faq.q}
                <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Ready to ace your next interview?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of students and job seekers improving their interview skills with AI.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/register">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
