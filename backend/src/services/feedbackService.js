import { generateJSON } from '../config/gemini.js';

/**
 * Generates AI feedback for a completed interview session.
 * @param {Array<{question: string, expected_answer: string, answer_text: string, topic: string}>} qaPairs
 * @returns {Promise<object>} feedback report data
 */
export const generateInterviewFeedback = async (qaPairs) => {
  const qaText = qaPairs
    .map(
      (qa, i) => `
Question ${i + 1} (Topic: ${qa.topic || 'General'}):
${qa.question}

Expected Answer Guidance:
${qa.expected_answer || 'N/A'}

Candidate's Answer:
${qa.answer_text || '(No answer provided)'}
`
    )
    .join('\n---\n');

  const prompt = `
You are an expert interview coach evaluating a candidate's mock interview performance.
Below are the questions asked, the expected answer guidance, and the candidate's actual answers.

${qaText}

Evaluate the candidate's overall performance and return ONLY a JSON object with this exact structure
(no markdown, no commentary):

{
  "overall_score": <number 0-100>,
  "technical_score": <number 0-100, accuracy and depth of technical knowledge>,
  "communication_score": <number 0-100, clarity and structure of communication>,
  "clarity_score": <number 0-100, how clear and well-organized the answers were>,
  "confidence_score": <number 0-100, inferred confidence based on answer completeness and tone>,
  "improvement_suggestions": ["array of 3-6 specific, actionable suggestions"],
  "better_sample_answers": [
    {"question": "the original question text", "sample_answer": "an improved sample answer"}
  ]
}

Scoring guidance:
- If an answer is empty or "(No answer provided)", score that question very low across all metrics.
- Be constructive but honest. Scores should reflect real interview standards.
- Provide better_sample_answers for at most 3 of the weakest-answered questions.
`;

  const result = await generateJSON(prompt, { temperature: 0.5 });

  const clamp = (n) => Math.max(0, Math.min(100, typeof n === 'number' ? n : 0));

  return {
    overall_score: clamp(result.overall_score),
    technical_score: clamp(result.technical_score),
    communication_score: clamp(result.communication_score),
    clarity_score: clamp(result.clarity_score),
    confidence_score: clamp(result.confidence_score),
    improvement_suggestions: result.improvement_suggestions || [],
    better_sample_answers: result.better_sample_answers || [],
  };
};
