import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mic, BarChart3, Map, TrendingUp, Award, Target, Activity, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, sessionsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/interviews/sessions'),
        ]);
        setOverview(overviewRes.data.data);
       setRecentSessions((sessionsRes.data.data?.sessions || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Interviews', value: overview?.totalInterviews ?? 0, icon: Activity, color: 'text-signal' },
    { label: 'Average Score', value: overview ? `${overview.averageScore}%` : '0%', icon: Target, color: 'text-violet' },
    { label: 'Highest Score', value: overview ? `${overview.highestScore}%` : '0%', icon: Award, color: 'text-amber' },
    { label: 'Improvement', value: overview ? `${overview.improvementPercentage > 0 ? '+' : ''}${overview.improvementPercentage}%` : '0%', icon: TrendingUp, color: 'text-success' },
  ];

  const quickActions = [
    { to: '/resume-analyzer', icon: FileText, title: 'Analyze Resume', description: 'Get your ATS score and improvement tips' },
    { to: '/mock-interview', icon: Mic, title: 'Start Mock Interview', description: 'Practice with AI-generated questions' },
    { to: '/roadmap', icon: Map, title: 'Generate Roadmap', description: 'Get a personalized learning plan' },
    { to: '/analytics', icon: BarChart3, title: 'View Analytics', description: 'Track your performance over time' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your interview preparation progress.</p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-1 font-mono text-2xl font-bold">{loading ? '—' : c.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to}>
              <Card className="h-full transition-transform hover:-translate-y-1 hover:border-primary/40">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-display font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Interviews</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reports">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Card className="mt-4">
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading...</p>
            ) : recentSessions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No interviews yet. Start your first mock interview!</p>
                <Button className="mt-4" asChild>
                  <Link to="/mock-interview">Start Mock Interview</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentSessions.map((s) => (
                  <Link
                    key={s.id}
                    to={`/mock-interview/results/${s.id}`}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium capitalize">{s.role?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.difficulty} • {new Date(s.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {s.feedback_reports?.[0] ? (
                        <p className="font-mono text-lg font-bold text-primary">{s.feedback_reports[0].overall_score}%</p>
                      ) : (
                        <span className="text-xs text-muted-foreground capitalize">{s.status}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
