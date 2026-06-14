import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { generateInterviewQuestions } from '../services/questionGenerationService.js';
import { generateInterviewFeedback } from '../services/feedbackService.js';
import { sendInterviewSummaryEmail } from '../services/emailService.js';
import { generateFeedbackPDF } from '../services/pdfReportService.js';

const VALID_ROLES = ['frontend_developer', 'backend_developer', 'full_stack_developer', 'data_analyst', 'software_engineer'];
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const VALID_TYPES = ['hr', 'technical', 'dsa', 'project_based'];

/**
 * POST /api/interviews/questions/generate
 * Body: { role, difficulty, questionTypes: string[], count? }
 * Generates questions via AI and stores them in interview_questions.
 */
export const generateQuestions = asyncHandler(async (req, res) => {
  const { role, difficulty, questionTypes, count = 5 } = req.body;

  if (!VALID_ROLES.includes(role)) throw new AppError('Invalid role', 400);
  if (!VALID_DIFFICULTIES.includes(difficulty)) throw new AppError('Invalid difficulty', 400);
  if (!Array.isArray(questionTypes) || !questionTypes.every((t) => VALID_TYPES.includes(t))) {
    throw new AppError('Invalid question types', 400);
  }
  if (count < 1 || count > 20) throw new AppError('Count must be between 1 and 20', 400);

  const generated = await generateInterviewQuestions({ role, difficulty, questionTypes, count });

  const rowsToInsert = generated.map((q) => ({
    user_id: req.user.id,
    role,
    difficulty: q.difficulty,
    question_type: q.question_type,
    question: q.question,
    expected_answer: q.expected_answer,
    topic: q.topic,
  }));

  const { data, error } = await req.supabase
    .from('interview_questions')
    .insert(rowsToInsert)
    .select();

  if (error) throw new AppError(error.message, 500);

  res.status(201).json({ success: true, data: { questions: data } });
});

/**
 * GET /api/interviews/questions
 * Query: role?, difficulty?, type?
 * Lists previously generated questions for the user.
 */
export const listQuestions = asyncHandler(async (req, res) => {
  const { role, difficulty, type } = req.query;

  let query = req.supabase.from('interview_questions').select('*').eq('user_id', req.user.id);

  if (role) query = query.eq('role', role);
  if (difficulty) query = query.eq('difficulty', difficulty);
  if (type) query = query.eq('question_type', type);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { questions: data } });
});

/**
 * POST /api/interviews/sessions
 * Body: { role, difficulty, questionTypes, questionIds: string[] }
 * Creates a new interview session and pre-populates answer slots.
 */
export const startSession = asyncHandler(async (req, res) => {
  const { role, difficulty, questionTypes, questionIds } = req.body;

  if (!VALID_ROLES.includes(role)) throw new AppError('Invalid role', 400);
  if (!VALID_DIFFICULTIES.includes(difficulty)) throw new AppError('Invalid difficulty', 400);
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new AppError('At least one question ID is required', 400);
  }

  const { data: session, error: sessionError } = await req.supabase
    .from('interview_sessions')
    .insert({
      user_id: req.user.id,
      role,
      difficulty,
      question_types: questionTypes,
      status: 'in_progress',
    })
    .select()
    .single();

  if (sessionError) throw new AppError(sessionError.message, 500);

  const answerRows = questionIds.map((qid, idx) => ({
    session_id: session.id,
    question_id: qid,
    user_id: req.user.id,
    question_order: idx + 1,
    answer_text: null,
  }));

  const { error: answersError } = await req.supabase.from('interview_answers').insert(answerRows);

  if (answersError) throw new AppError(answersError.message, 500);

  // Return session with joined questions for the frontend interview screen
  const { data: fullSession, error: fetchError } = await req.supabase
    .from('interview_sessions')
    .select(
      `*, interview_answers(
        id, question_order, answer_text, time_spent_seconds,
        interview_questions(id, question, expected_answer, topic, difficulty, question_type)
      )`
    )
    .eq('id', session.id)
    .single();

  if (fetchError) throw new AppError(fetchError.message, 500);

  res.status(201).json({ success: true, data: { session: fullSession } });
});

/**
 * PUT /api/interviews/sessions/:id/answers/:questionId
 * Body: { answerText, timeSpentSeconds? }
 * Saves/updates a user's answer for a specific question in a session.
 */
export const saveAnswer = asyncHandler(async (req, res) => {
  const { id: sessionId, questionId } = req.params;
  const { answerText, timeSpentSeconds } = req.body;

  const { data, error } = await req.supabase
    .from('interview_answers')
    .update({
      answer_text: answerText,
      time_spent_seconds: timeSpentSeconds ?? null,
    })
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { answer: data } });
});

/**
 * POST /api/interviews/sessions/:id/complete
 * Marks the session complete, runs AI feedback generation, generates PDF report,
 * sends summary email, and updates user_progress.
 */
export const completeSession = asyncHandler(async (req, res) => {
  const { id: sessionId } = req.params;
  const { durationSeconds } = req.body;

  // 1. Fetch session + answers + questions
  const { data: session, error: sessionError } = await req.supabase
    .from('interview_sessions')
    .select(
      `*, interview_answers(
        id, answer_text, question_order,
        interview_questions(id, question, expected_answer, topic)
      )`
    )
    .eq('id', sessionId)
    .eq('user_id', req.user.id)
    .single();

  if (sessionError) throw new AppError('Session not found', 404);
  if (session.status === 'completed') throw new AppError('Session already completed', 400);

  // 2. Mark session complete
  const { error: updateError } = await req.supabase
    .from('interview_sessions')
    .update({
      status: 'completed',
      duration_seconds: durationSeconds || null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (updateError) throw new AppError(updateError.message, 500);

  // 3. Build QA pairs and generate AI feedback
  const qaPairs = session.interview_answers
    .sort((a, b) => a.question_order - b.question_order)
    .map((a) => ({
      question: a.interview_questions.question,
      expected_answer: a.interview_questions.expected_answer,
      answer_text: a.answer_text,
      topic: a.interview_questions.topic,
    }));

  const feedback = await generateInterviewFeedback(qaPairs);

  // 4. Store feedback report
  const { data: feedbackReport, error: feedbackError } = await req.supabase
    .from('feedback_reports')
    .insert({
      session_id: sessionId,
      user_id: req.user.id,
      overall_score: feedback.overall_score,
      technical_score: feedback.technical_score,
      communication_score: feedback.communication_score,
      clarity_score: feedback.clarity_score,
      confidence_score: feedback.confidence_score,
      improvement_suggestions: feedback.improvement_suggestions,
      better_sample_answers: feedback.better_sample_answers,
    })
    .select()
    .single();

  if (feedbackError) throw new AppError(feedbackError.message, 500);

  // 5. Generate PDF report and upload to storage
  let pdfPath = null;
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', req.user.id)
      .single();

    const pdfBuffer = await generateFeedbackPDF({
      candidateName: profile?.full_name || req.user.email,
      session,
      qaPairs,
      feedback,
    });

    pdfPath = `${req.user.id}/${sessionId}.pdf`;
    await supabaseAdmin.storage.from('reports').upload(pdfPath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    await req.supabase
      .from('feedback_reports')
      .update({ pdf_report_path: pdfPath })
      .eq('id', feedbackReport.id);
  } catch (err) {
    console.error('PDF generation/upload failed (non-fatal):', err.message);
  }

  // 6. Update user_progress
  await updateUserProgress(req.supabase, req.user.id, feedback.overall_score);

  // 7. Send email notification (non-blocking failure)
  try {
    await sendInterviewSummaryEmail({
      to: req.user.email,
      candidateName: req.user.email,
      overallScore: feedback.overall_score,
      feedback,
      sessionId,
    });
  } catch (err) {
    console.error('Email send failed (non-fatal):', err.message);
  }

  // 8. Create in-app notification
  await req.supabase.from('notifications').insert({
    user_id: req.user.id,
    type: 'interview_summary',
    title: 'Interview Completed',
    message: `Your mock interview is complete! Overall score: ${feedback.overall_score}/100.`,
    metadata: { session_id: sessionId, feedback_report_id: feedbackReport.id },
  });

  res.json({
    success: true,
    message: 'Interview completed and feedback generated',
    data: { feedback: { ...feedbackReport, pdf_report_path: pdfPath } },
  });
});

/**
 * Helper: recalculates and upserts user_progress after a completed interview.
 */
const updateUserProgress = async (client, userId, latestScore) => {
  const { data: reports } = await client
    .from('feedback_reports')
    .select('overall_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (!reports || reports.length === 0) return;

  const scores = reports.map((r) => Number(r.overall_score));
  const total = scores.length;
  const average = scores.reduce((a, b) => a + b, 0) / total;
  const highest = Math.max(...scores);

  let improvement = 0;
  if (total >= 2) {
    const first = scores[0];
    const last = scores[total - 1];
    improvement = first === 0 ? 0 : ((last - first) / first) * 100;
  }

  await client
    .from('user_progress')
    .update({
      total_interviews: total,
      average_score: Number(average.toFixed(2)),
      highest_score: highest,
      improvement_percentage: Number(improvement.toFixed(2)),
      last_interview_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
};

/**
 * GET /api/interviews/sessions
 * Lists the user's interview sessions (history) with feedback summaries.
 */
export const listSessions = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('interview_sessions')
    .select('*, feedback_reports(*)')
    .eq('user_id', req.user.id)
    .order('started_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { sessions: data } });
});

/**
 * GET /api/interviews/sessions/:id
 * Returns full session details: questions, answers, feedback.
 */
export const getSessionDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await req.supabase
    .from('interview_sessions')
    .select(
      `*, feedback_reports(*),
      interview_answers(
        id, answer_text, question_order, time_spent_seconds,
        interview_questions(id, question, expected_answer, topic, difficulty, question_type)
      )`
    )
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error) throw new AppError('Session not found', 404);

  res.json({ success: true, data: { session: data } });
});
