import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Download, Lightbulb, Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function MockInterviewResultsPage() {
  const { id: sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/interviews/sessions/${sessionId}`);
        setSession(data.data.session);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Failed to load results', description: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId, toast]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const feedbackId = session.feedback_reports[0].id;
      const { data } = await api.get(`/reports/${feedbackId}/download`);
      window.open(data.data.url, '_blank');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Download failed', description: err.message });
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const feedback = session.feedback_reports?.[0];

  if (!feedback) {
    return (
      <div className="text-center text-muted-foreground">
        Feedback is still being generated. Please check back shortly.
      </div>
    );
  }

  const scoreCards = [
    { label: 'Overall', value: feedback.overall_score, color: 'text-primary' },
    { label: 'Technical', value: feedback.technical_score, color: 'text-violet' },
    { label: 'Communication', value: feedback.communication_score, color: 'text-amber' },
    { label: 'Clarity', value: feedback.clarity_score, color: 'text-success' },
    { label: 'Confidence', value: feedback.confidence_score, color: 'text-signal' },
  ];

  const sortedAnswers = [...session.interview_answers].sort((a, b) => a.question_order - b.question_order);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link to="/mock-interview">
              <ArrowLeft className="h-4 w-4" /> Back to setup
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-bold sm:text-3xl capitalize">{session.role?.replace(/_/g, ' ')} — Feedback Report</h1>
          <p className="mt-1 text-muted-foreground capitalize">
            {session.difficulty} • Completed {new Date(session.completed_at).toLocaleString()}
          </p>
        </div>
        <Button onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PDF
        </Button>
      </div>

      {/* Score cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {scoreCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`font-mono text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              <Progress value={s.value} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Improvement suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-amber" /> Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {feedback.improvement_suggestions?.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" /> {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sample Answers */}
      {feedback.better_sample_answers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-signal" /> Suggested Sample Answers
            </CardTitle>
            <CardDescription>AI-generated improved answers for your weaker responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.better_sample_answers.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <p className="font-medium text-sm">{s.question}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.sample_answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Full Q&A */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions & Your Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedAnswers.map((a, i) => (
            <div key={a.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">Q{i + 1}</Badge>
                {a.interview_questions.topic && <Badge variant="secondary">{a.interview_questions.topic}</Badge>}
              </div>
              <p className="font-medium">{a.interview_questions.question}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Your answer: </span>
                {a.answer_text || <em>No answer provided</em>}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
