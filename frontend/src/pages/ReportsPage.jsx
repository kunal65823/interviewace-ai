import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Download, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reports');
        setReports(data.data.reports);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Failed to load reports', description: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleDownload = async (reportId) => {
    setDownloadingId(reportId);
    try {
      const { data } = await api.get(`/reports/${reportId}/download`);
      window.open(data.data.url, '_blank');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Download failed', description: err.message });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Interview Reports</h1>
        <p className="mt-1 text-muted-foreground">View and download your past interview feedback reports.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
            No reports yet. Complete a mock interview to generate your first report.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-semibold capitalize">
                      {r.interview_sessions?.role?.replace(/_/g, ' ')} Interview
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {r.interview_sessions?.difficulty} • {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="default" className="font-mono">
                    {r.overall_score}%
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/mock-interview/results/${r.session_id}`}>
                      <Eye className="h-4 w-4" /> View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(r.id)}
                    disabled={downloadingId === r.id || !r.pdf_report_path}
                  >
                    {downloadingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
