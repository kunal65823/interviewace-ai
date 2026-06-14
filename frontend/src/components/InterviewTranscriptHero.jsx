import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const transcript = [
  { role: 'ai', text: 'Tell me about a time you optimized a slow React component.' },
  { role: 'user', text: 'I noticed unnecessary re-renders in our dashboard, so I memoized the chart components with React.memo and useMemo for derived data...' },
  { role: 'ai', text: 'Great. What was the measurable impact?' },
  { role: 'user', text: 'Render time dropped from 480ms to 90ms, and the dashboard felt instant on lower-end devices.' },
];

const scoreLabels = [
  { label: 'Technical', value: 88 },
  { label: 'Communication', value: 92 },
  { label: 'Clarity', value: 85 },
  { label: 'Confidence', value: 90 },
];

export default function InterviewTranscriptHero() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showScores, setShowScores] = useState(false);

  useEffect(() => {
    if (visibleCount < transcript.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), 1100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowScores(true), 600);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  return (
    <div className="relative rounded-2xl border border-border bg-card/60 p-1 shadow-2xl backdrop-blur">
      <div className="rounded-xl bg-surface2/60 p-4">
        {/* Window chrome */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-destructive/70" />
            <span className="h-3 w-3 rounded-full bg-amber/70" />
            <span className="h-3 w-3 rounded-full bg-success/70" />
          </div>
          <span className="ml-2 font-mono text-xs text-muted-foreground">mock-interview — Frontend Developer · Intermediate</span>
        </div>

        {/* Transcript */}
        <div className="space-y-3 font-mono text-sm">
          {transcript.slice(0, visibleCount).map((msg, i) => (
            <div
              key={i}
              className={cnRow(msg.role)}
            >
              {msg.role === 'ai' ? (
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              ) : (
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet/20 text-center text-[10px] font-bold leading-4 text-violet">U</span>
              )}
              <p className="leading-relaxed text-foreground/90">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Score reveal */}
        {showScores && (
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 animate-fade-in-up sm:grid-cols-4">
            {scoreLabels.map((s) => (
              <div key={s.label} className="rounded-lg bg-background/60 p-3 text-center">
                <p className="font-mono text-2xl font-bold text-signal">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {showScores && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success animate-fade-in-up">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Feedback report generated — improvement suggestions ready.
          </div>
        )}
      </div>
    </div>
  );
}

function cnRow(role) {
  return `flex items-start gap-2 rounded-lg p-2 ${role === 'ai' ? 'bg-signal/5' : 'bg-violet/5'}`;
}
