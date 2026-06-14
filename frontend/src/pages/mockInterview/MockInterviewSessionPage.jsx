import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function MockInterviewSessionPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> text
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const saveTimeoutRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const loadSession = useCallback(async () => {
    try {
      const { data } = await api.get(`/interviews/sessions/${sessionId}`);
      const s = data.data.session;
      setSession(s);

      const initialAnswers = {};
      s.interview_answers
        .sort((a, b) => a.question_order - b.question_order)
        .forEach((a) => {
          initialAnswers[a.interview_questions.id] = a.answer_text || '';
        });
      setAnswers(initialAnswers);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to load session', description: err.message });
      navigate('/mock-interview');
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate, toast]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedAnswers = [...session.interview_answers].sort((a, b) => a.question_order - b.question_order);
  const current = sortedAnswers[currentIndex];
  const question = current.interview_questions;
  const totalQuestions = sortedAnswers.length;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const saveAnswer = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.put(`/interviews/sessions/${sessionId}/answers/${questionId}`, {
          answerText: text,
          timeSpentSeconds: elapsedSeconds,
        });
      } catch (err) {
        console.error('Failed to save answer:', err.message);
      }
    }, 800);
  };

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);

    // Flush any pending save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    try {
      await api.put(`/interviews/sessions/${sessionId}/answers/${question.id}`, {
        answerText: answers[question.id],
        timeSpentSeconds: elapsedSeconds,
      });

      const { data } = await api.post(`/interviews/sessions/${sessionId}/complete`, {
        durationSeconds: elapsedSeconds,
      });

      toast({ title: 'Interview completed!', description: `Overall score: ${data.data.feedback.overall_score}/100` });
      navigate(`/mock-interview/results/${sessionId}`);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to submit interview', description: err.message });
      setSubmitting(false);
    }
  };

  const typeLabels = {
    hr: 'HR / Behavioral',
    technical: 'Technical',
    dsa: 'DSA',
    project_based: 'Project-Based',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl capitalize">{session.role?.replace(/_/g, ' ')} Interview</h1>
          <p className="text-sm text-muted-foreground capitalize">{session.difficulty} difficulty</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm">
          <Clock className="h-4 w-4 text-primary" />
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {sortedAnswers.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i === currentIndex ? 'bg-primary' : answers[a.interview_questions.id] ? 'bg-success/60' : 'bg-muted'
            }`}
            aria-label={`Go to question ${i + 1}`}
          />
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Question {currentIndex + 1} of {totalQuestions}
      </p>

      {/* Question card */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="default">{typeLabels[question.question_type] || question.question_type}</Badge>
            {question.topic && <Badge variant="outline">{question.topic}</Badge>}
          </div>
          <h2 className="font-display text-lg font-semibold leading-relaxed">{question.question}</h2>

          <textarea
            className="mt-4 min-h-[200px] w-full rounded-lg border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type your answer here..."
            value={answers[question.id] || ''}
            onChange={(e) => saveAnswer(question.id, e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        {currentIndex === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {submitting ? 'Generating feedback...' : 'Submit Interview'}
          </Button>
        ) : (
          <Button onClick={goNext}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
