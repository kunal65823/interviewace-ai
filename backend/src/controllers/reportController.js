import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const REPORTS_BUCKET = 'reports';
const SIGNED_URL_EXPIRY_SECONDS = 60 * 10; // 10 minutes

/**
 * GET /api/reports
 * Lists all feedback reports for the user (with session context).
 */
export const listReports = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('feedback_reports')
    .select('*, interview_sessions(role, difficulty, started_at, completed_at)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { reports: data } });
});

/**
 * GET /api/reports/:id/download
 * Returns a signed URL to download the PDF report.
 */
export const downloadReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: report, error } = await req.supabase
    .from('feedback_reports')
    .select('pdf_report_path')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error) throw new AppError('Report not found', 404);
  if (!report.pdf_report_path) throw new AppError('PDF report not available for this interview', 404);

  const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(report.pdf_report_path, SIGNED_URL_EXPIRY_SECONDS);

  if (signedUrlError) throw new AppError(signedUrlError.message, 500);

  res.json({ success: true, data: { url: signedUrlData.signedUrl, expiresIn: SIGNED_URL_EXPIRY_SECONDS } });
});
