import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { extractTextFromPDF } from '../utils/pdfExtractor.js';
import { analyzeResumeText } from '../services/resumeAnalysisService.js';

const RESUME_BUCKET = 'resumes';

/**
 * POST /api/resumes/upload
 * multipart/form-data with field "resume" (PDF)
 * Uploads resume to Supabase Storage, extracts text, runs AI analysis,
 * and stores results in resumes + resume_analysis tables.
 */
export const uploadAndAnalyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No resume file uploaded. Field name must be "resume".', 400);
  }

  const userId = req.user.id;
  const file = req.file;
  const filePath = `${userId}/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) throw new AppError(`File upload failed: ${uploadError.message}`, 500);

  // 2. Record in `resumes` table
  const { data: resumeRecord, error: resumeError } = await req.supabase
    .from('resumes')
    .insert({
      user_id: userId,
      file_name: file.originalname,
      file_path: filePath,
      file_size_bytes: file.size,
    })
    .select()
    .single();

  if (resumeError) throw new AppError(resumeError.message, 500);

  // 3. Extract text from PDF
  let extractedText = '';
  try {
    extractedText = await extractTextFromPDF(file.buffer);
  } catch (err) {
    throw new AppError(`Failed to extract text from PDF: ${err.message}`, 422);
  }

  if (!extractedText || extractedText.length < 50) {
    throw new AppError('Could not extract sufficient text from the resume. Please upload a text-based PDF.', 422);
  }

  // 4. Run AI analysis
  let analysis;
  try {
    analysis = await analyzeResumeText(extractedText);
  } catch (err) {
    throw new AppError(`AI analysis failed: ${err.message}`, 502);
  }

  // 5. Store analysis results
  const { data: analysisRecord, error: analysisError } = await req.supabase
    .from('resume_analysis')
    .insert({
      resume_id: resumeRecord.id,
      user_id: userId,
      extracted_text: extractedText,
      skills: analysis.skills,
      projects: analysis.projects,
      education: analysis.education,
      technologies: analysis.technologies,
      summary: analysis.summary,
      ats_score: analysis.ats_score,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      missing_keywords: analysis.missing_keywords,
      suggested_improvements: analysis.suggested_improvements,
    })
    .select()
    .single();

  if (analysisError) throw new AppError(analysisError.message, 500);

  res.status(201).json({
    success: true,
    message: 'Resume uploaded and analyzed successfully',
    data: {
      resume: resumeRecord,
      analysis: analysisRecord,
    },
  });
});

/**
 * GET /api/resumes
 * Returns the user's uploaded resumes with their latest analysis.
 */
export const getResumes = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('resumes')
    .select('*, resume_analysis(*)')
    .eq('user_id', req.user.id)
    .order('uploaded_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { resumes: data } });
});

/**
 * GET /api/resumes/:id/analysis
 * Returns full analysis for a specific resume.
 */
export const getResumeAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await req.supabase
    .from('resume_analysis')
    .select('*')
    .eq('resume_id', id)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw new AppError('Analysis not found', 404);

  res.json({ success: true, data: { analysis: data } });
});

/**
 * DELETE /api/resumes/:id
 * Deletes a resume, its storage object, and its analysis (cascades).
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: resume, error: fetchError } = await req.supabase
    .from('resumes')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (fetchError) throw new AppError('Resume not found', 404);

  await supabaseAdmin.storage.from(RESUME_BUCKET).remove([resume.file_path]);

  const { error: deleteError } = await req.supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id);

  if (deleteError) throw new AppError(deleteError.message, 500);

  res.json({ success: true, message: 'Resume deleted successfully' });
});
