import { generateJSON } from '../config/gemini.js';

/**
 * Analyzes resume text using Gemini and returns structured analysis data.
 * @param {string} resumeText - Extracted plain text from the resume PDF
 * @returns {Promise<object>} structured analysis
 */
export const analyzeResumeText = async (resumeText) => {
  const prompt = `
You are an expert technical recruiter and ATS (Applicant Tracking System) analyzer.
Analyze the following resume text and return a JSON object with EXACTLY this structure
(no extra commentary, no markdown):

{
  "skills": ["string array of technical and soft skills found"],
  "projects": [{"name": "string", "description": "string", "technologies": ["string"]}],
  "education": [{"degree": "string", "institution": "string", "year": "string"}],
  "technologies": ["string array of all tools, frameworks, languages mentioned"],
  "summary": "a concise 3-4 sentence professional summary of the candidate",
  "ats_score": <integer 0-100 representing ATS compatibility>,
  "strengths": ["string array of 3-5 key strengths"],
  "weaknesses": ["string array of 2-4 areas needing improvement"],
  "missing_keywords": ["string array of important industry keywords missing from the resume"],
  "suggested_improvements": ["string array of 3-5 actionable suggestions to improve the resume"]
}

Resume text:
"""
${resumeText.slice(0, 15000)}
"""
`;

  const result = await generateJSON(prompt, { temperature: 0.4 });

  // Defensive defaults in case the model omits fields
  return {
    skills: result.skills || [],
    projects: result.projects || [],
    education: result.education || [],
    technologies: result.technologies || [],
    summary: result.summary || '',
    ats_score: typeof result.ats_score === 'number' ? Math.max(0, Math.min(100, result.ats_score)) : 0,
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    missing_keywords: result.missing_keywords || [],
    suggested_improvements: result.suggested_improvements || [],
  };
};
