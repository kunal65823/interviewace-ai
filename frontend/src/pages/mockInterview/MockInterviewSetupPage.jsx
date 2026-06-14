import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const questionTypes = [
  { value: 'hr', label: 'HR / Behavioral' },
  { value: 'technical', label: 'Technical' },
  { value: 'dsa', label: 'DSA' },
  { value: 'project_based', label: 'Project-Based' },
];

const counts = [5, 8, 10, 15];

export default function MockInterviewSetupPage() {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['technical']);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleType = (type) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleStart = async () => {
    if (!role || !difficulty || selectedTypes.length === 0) {
      toast({ variant: 'destructive', title: 'Missing information', description: 'Please select a role, difficulty, and at least one question type.' });
      return;
    }

    setLoading(true);
    try {
      // 1. Generate questions
      const { data: genData } = await api.post('/interviews/questions/generate', {
        role,
        difficulty,
        questionTypes: selectedTypes,
        count,
      });

      const questionIds = genData.data.questions.map((q) => q.id);

      // 2. Start session
      const { data: sessionData } = await api.post('/interviews/sessions', {
        role,
        difficulty,
        questionTypes: selectedTypes,
        questionIds,
      });

      navigate(`/mock-interview/session/${sessionData.data.session.id}`);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to start interview', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Start a Mock Interview</h1>
        <p className="mt-1 text-muted-foreground">Customize your practice session and let AI generate tailored questions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview Configuration</CardTitle>
          <CardDescription>Choose your target role, difficulty, and question focus areas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role */}
          <div className="space-y-2">
            <Label>Target Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                    difficulty === d.value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-2">
            <Label>Question Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {questionTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                    selectedTypes.includes(t.value) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <div className="grid grid-cols-4 gap-2">
              {counts.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`rounded-lg border p-3 text-sm font-mono font-medium transition-colors ${
                    count === c ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleStart} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Generating questions...' : 'Generate Questions & Start'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
