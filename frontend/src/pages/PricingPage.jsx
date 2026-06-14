import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started with interview prep',
    features: [
      '3 mock interviews / month',
      'Basic resume analysis',
      'Score tracking dashboard',
      'Email notifications',
      'Community support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/ month',
    description: 'For serious, unlimited interview prep',
    features: [
      'Unlimited mock interviews',
      'Advanced resume analysis + ATS score',
      'Full analytics with score trends',
      'Personalized learning roadmaps',
      'Downloadable PDF reports',
      'Priority email support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Campus',
    price: 'Custom',
    period: 'for institutions',
    description: 'For colleges, bootcamps & training institutes',
    features: [
      'Everything in Pro',
      'Admin dashboard with platform analytics',
      'Bulk student account provisioning',
      'Usage & performance reporting',
      'Dedicated onboarding support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const comparisonRows = [
  { feature: 'Mock interviews per month', free: '3', pro: 'Unlimited', campus: 'Unlimited' },
  { feature: 'Resume ATS scoring', free: 'Basic', pro: 'Advanced', campus: 'Advanced' },
  { feature: 'Analytics dashboard', free: '✓', pro: '✓', campus: '✓' },
  { feature: 'Learning roadmaps', free: '—', pro: '✓', campus: '✓' },
  { feature: 'PDF report downloads', free: '—', pro: '✓', campus: '✓' },
  { feature: 'Admin panel', free: '—', pro: '—', campus: '✓' },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
        <p className="mt-4 text-muted-foreground">Start free, upgrade anytime. No hidden fees.</p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
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

      {/* Comparison table */}
      <div className="mt-20">
        <h2 className="text-center font-display text-2xl font-bold">Compare plans</h2>
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-card">
              <tr>
                <th className="p-4 font-display">Feature</th>
                <th className="p-4 font-display text-center">Free</th>
                <th className="p-4 font-display text-center text-primary">Pro</th>
                <th className="p-4 font-display text-center">Campus</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-background' : 'bg-card/50'}>
                  <td className="p-4">{row.feature}</td>
                  <td className="p-4 text-center text-muted-foreground">{row.free}</td>
                  <td className="p-4 text-center font-semibold text-primary">{row.pro}</td>
                  <td className="p-4 text-center text-muted-foreground">{row.campus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
