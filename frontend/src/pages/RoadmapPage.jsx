import React, { useEffect, useState } from 'react';
import { Loader2, Map, Sparkles, Clock, BookOpen, Wrench, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const roles = [
  { value: 'frontend_developer', label: 'Frontend Developer' },
  { value: 'backend_developer', label: 'Backend Developer' },
  { value: 'full_stack_developer', label: 'Full Stack Developer' },
  { value: 'data_analyst', label: 'Data Analyst' },
  { value: 'software_engineer', label: 'Software Engineer' },
];

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function RoadmapPage() {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const loadRoadmaps = async () => {
    try {
      const { data } = await api.get('/roadmaps');
      setRoadmaps(data.data.roadmaps);
      if (data.data.roadmaps.length > 0) setActiveRoadmap(data.data.roadmaps[0]);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to load roadmaps', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!role || !level) {
      toast({ variant: 'destructive', title: 'Missing information', description: 'Please select a desired role and current skill level.' });
      return;
    }

    setGenerating(true);
    try {
      const { data } = await api.post('/roadmaps/generate', { desiredRole: role, currentSkillLevel: level });
      toast({ title: 'Roadmap generated!', description: 'Your personalized learning plan is ready.' });
      setActiveRoadmap(data.data.roadmap);
      await loadRoadmaps();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Generation failed', description: err.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Learning Roadmap</h1>
        <p className="mt-1 text-muted-foreground">Get a personalized, week-by-week plan to reach your target role.</p>
      </div>

      {/* Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate a New Roadmap</CardTitle>
          <CardDescription>Tell us your goal and current level — AI will build the plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Desired Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Skill Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4 w-full sm:w-auto" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Generating roadmap...' : 'Generate Roadmap'}
          </Button>
        </CardContent>
      </Card>

      {/* History selector */}
      {roadmaps.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {roadmaps.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoadmap(r)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeRoadmap?.id === r.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              {r.desired_role.replace(/_/g, ' ')} — {new Date(r.created_at).toLocaleDateString()}
            </button>
          ))}
        </div>
      )}

      {/* Roadmap display */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !activeRoadmap ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Map className="mx-auto mb-3 h-10 w-10 opacity-40" />
            Generate your first learning roadmap to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-sm text-muted-foreground">Roadmap for</p>
                <p className="font-display text-xl font-bold capitalize">{activeRoadmap.desired_role.replace(/_/g, ' ')}</p>
                <p className="text-sm capitalize text-muted-foreground">Starting from {activeRoadmap.current_skill_level} level</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-primary">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{activeRoadmap.estimated_timeline_weeks} weeks</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Technologies */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" /> Skills to Learn
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {activeRoadmap.skills_to_learn?.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-4 w-4 text-violet" /> Recommended Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {activeRoadmap.recommended_technologies?.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Suggested Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Rocket className="h-4 w-4 text-amber" /> Suggested Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {activeRoadmap.suggested_projects?.map((p, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-semibold">{p.title}</p>
                    <Badge variant="outline" className="capitalize shrink-0">{p.difficulty}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Learning Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeRoadmap.weekly_plan?.map((w, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                    {String(w.week)}
                  </div>
                  <div className="flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
                    <p className="font-medium">{w.focus}</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {w.tasks?.map((t, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
