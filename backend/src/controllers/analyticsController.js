import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/analytics/overview
 * Returns dashboard cards: total interviews, average score, highest score, improvement %.
 */
export const getOverview = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw new AppError(error.message, 500);

  res.json({
    success: true,
    data: {
      totalInterviews: data.total_interviews,
      averageScore: data.average_score,
      highestScore: data.highest_score,
      improvementPercentage: data.improvement_percentage,
      lastInterviewAt: data.last_interview_at,
    },
  });
});

/**
 * GET /api/analytics/trends
 * Returns score trend data for charts: overall, technical, communication over time.
 */
export const getTrends = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('feedback_reports')
    .select('overall_score, technical_score, communication_score, clarity_score, confidence_score, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: true });

  if (error) throw new AppError(error.message, 500);

  const trends = data.map((row, idx) => ({
    interviewNumber: idx + 1,
    date: row.created_at,
    overallScore: Number(row.overall_score),
    technicalScore: Number(row.technical_score),
    communicationScore: Number(row.communication_score),
    clarityScore: Number(row.clarity_score),
    confidenceScore: Number(row.confidence_score),
  }));

  res.json({ success: true, data: { trends } });
});
