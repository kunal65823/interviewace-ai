import React, { useEffect, useState } from 'react';
import { Loader2, Users, Activity, TrendingUp, Zap, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminPanelPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAll = async (searchTerm = '') => {
    try {
      const [statsRes, usersRes, interviewsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users', { params: { search: searchTerm, limit: 20 } }),
        api.get('/admin/interviews', { params: { limit: 20 } }),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
      setInterviews(interviewsRes.data.data.interviews);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to load admin data', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAll(search);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-signal' },
    { label: 'Total Interviews', value: stats?.totalInterviews ?? 0, icon: Activity, color: 'text-violet' },
    { label: 'Avg Platform Score', value: `${stats?.averagePlatformScore ?? 0}%`, icon: TrendingUp, color: 'text-amber' },
    { label: 'Daily Active Users', value: stats?.dailyActiveUsers ?? 0, icon: Zap, color: 'text-success' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Monitor platform usage, users, and interview activity.</p>
      </div>

      {/* Stats cards */}
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

      {/* Popular Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most Popular Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats?.mostPopularRoles?.map((r) => (
              <Badge key={r.role} variant="default" className="capitalize">
                {r.role.replace(/_/g, ' ')} — {r.session_count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="interviews">Interview Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Users</CardTitle>
                <CardDescription>All registered candidates</CardDescription>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border bg-muted/50">
                  <tr>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium">Target Role</th>
                    <th className="p-3 font-medium">Skill Level</th>
                    <th className="p-3 font-medium">Interviews</th>
                    <th className="p-3 font-medium">Avg Score</th>
                    <th className="p-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{u.full_name || '—'}</td>
                      <td className="p-3">
                        <Badge variant={u.role === 'admin' ? 'destructive' : 'outline'} className="capitalize">{u.role}</Badge>
                      </td>
                      <td className="p-3 capitalize text-muted-foreground">{u.target_role?.replace(/_/g, ' ') || '—'}</td>
                      <td className="p-3 capitalize text-muted-foreground">{u.current_skill_level || '—'}</td>
                      <td className="p-3 font-mono">{u.user_progress?.[0]?.total_interviews ?? 0}</td>
                      <td className="p-3 font-mono">{u.user_progress?.[0]?.average_score ?? 0}%</td>
                      <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No users found.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Interviews</CardTitle>
              <CardDescription>Platform-wide interview sessions</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border bg-muted/50">
                  <tr>
                    <th className="p-3 font-medium">Candidate</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium">Difficulty</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Score</th>
                    <th className="p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{s.profiles?.full_name || '—'}</td>
                      <td className="p-3 capitalize text-muted-foreground">{s.role?.replace(/_/g, ' ')}</td>
                      <td className="p-3 capitalize text-muted-foreground">{s.difficulty}</td>
                      <td className="p-3">
                        <Badge variant={s.status === 'completed' ? 'success' : 'outline'} className="capitalize">{s.status}</Badge>
                      </td>
                      <td className="p-3 font-mono">{s.feedback_reports?.[0]?.overall_score ?? '—'}</td>
                      <td className="p-3 text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {interviews.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No interviews found.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
