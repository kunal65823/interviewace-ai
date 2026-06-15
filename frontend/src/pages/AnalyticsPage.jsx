import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Activity, Target, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/trends'),
        ]);
        setOverview(overviewRes.data.data || null);
        setTrends(trendsRes.data.data?.trends || []);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Failed to load analytics', description: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Interviews', value: overview?.totalInterviews ?? 0, icon: Activity, color: 'text-signal' },
    { label: 'Average Score', value: `${overview?.averageScore ?? 0}%`, icon: Target, color: 'text-violet' },
    { label: 'Highest Score', value: `${overview?.highestScore ?? 0}%`, icon: Award, color: 'text-amber' },
    { label: 'Improvement', value: `${overview?.improvementPercentage > 0 ? '+' : ''}${overview?.improvementPercentage ?? 0}%`, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Track your interview performance trends over time.</p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-1 font-mono text-2xl font-bold">{c.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trends.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No interview data yet. Complete a mock interview to see your performance trends.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Trend</CardTitle>
              <CardDescription>Your overall score across all completed interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="interviewNumber" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `#${v}`} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="overallScore" name="Overall Score" stroke="#22D3EE" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Technical vs Communication */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Technical Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="interviewNumber" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `#${v}`} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="technicalScore" name="Technical" stroke="#A78BFA" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Communication Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="interviewNumber" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `#${v}`} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="communicationScore" name="Communication" stroke="#FBBF24" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* All metrics combined */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="interviewNumber" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `#${v}`} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="overallScore" name="Overall" stroke="#22D3EE" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="technicalScore" name="Technical" stroke="#A78BFA" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="communicationScore" name="Communication" stroke="#FBBF24" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clarityScore" name="Clarity" stroke="#4ADE80" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="confidenceScore" name="Confidence" stroke="#F472B6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
