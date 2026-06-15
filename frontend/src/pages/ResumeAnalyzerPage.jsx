import React, { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Lightbulb, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const loadResumes = async () => {
    try {
      const { data } = await api.get('/resumes');
      setResumes(data.data?.resumes || []);
      if (data.data.resumes.length > 0 && !activeAnalysis) {
        setActiveAnalysis(data.data.resumes[0].resume_analysis?.[0] || null);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to load resumes', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please upload a PDF file.' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const { data } = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Resume analyzed!', description: 'Your AI analysis is ready below.' });
      setActiveAnalysis(data.data.analysis);
      await loadResumes();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resumes/${id}`);
      toast({ title: 'Resume deleted' });
      setActiveAnalysis(null);
      await loadResumes();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Resume Analyzer</h1>
        <p className="mt-1 text-muted-foreground">Upload your resume to get an AI-powered ATS score and improvement suggestions.</p>
      </div>

      {/* Upload area */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-display font-semibold">{uploading ? 'Analyzing your resume...' : 'Upload your resume (PDF)'}</p>
              <p className="mt-1 text-sm text-muted-foreground">Max file size 5MB. We'll extract skills, projects, and generate an ATS score.</p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Analyzing...' : 'Choose File'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resume history + analysis */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Resume list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Your Resumes</CardTitle>
            <CardDescription>Select a resume to view its analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
            ) : (
              resumes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => setActiveAnalysis(r.resume_analysis?.[0] || null)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="overflow-hidden">
                      <p className="truncate text-sm font-medium">{r.file_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Analysis details */}
        <div className="space-y-6 lg:col-span-2">
          {!activeAnalysis ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Upload a resume to see your AI analysis here.
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ATS Score */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ATS Compatibility Score</p>
                      <p className="font-mono text-4xl font-bold text-primary">{activeAnalysis.ats_score}/100</p>
                    </div>
                    <ScoreBadge score={activeAnalysis.ats_score} />
                  </div>
                  <Progress value={activeAnalysis.ats_score} className="mt-4" />
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resume Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground/90">{activeAnalysis.summary}</p>
                </CardContent>
              </Card>

              {/* Skills & Technologies */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skills Detected</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {activeAnalysis.skills?.map((s) => (
                      <Badge key={s} variant="default">{s}</Badge>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Technologies</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {activeAnalysis.technologies?.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle2 className="h-4 w-4 text-success" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {activeAnalysis.strengths?.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" /> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-4 w-4 text-amber" /> Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {activeAnalysis.weaknesses?.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" /> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Missing Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Missing Keywords</CardTitle>
                  <CardDescription>Consider adding these to improve ATS matching</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {activeAnalysis.missing_keywords?.map((k) => (
                    <Badge key={k} variant="destructive">{k}</Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Suggested Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4 text-signal" /> Suggested Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {activeAnalysis.suggested_improvements?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" /> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  let variant = 'destructive';
  let label = 'Needs Work';
  if (score >= 80) {
    variant = 'success';
    label = 'Excellent';
  } else if (score >= 60) {
    variant = 'warning';
    label = 'Good';
  }
  return <Badge variant={variant}>{label}</Badge>;
}
