import { generateJSON } from '../config/gemini.js';

const ROLE_LABELS = {
  frontend_developer: 'Frontend Developer',
  backend_developer: 'Backend Developer',
  full_stack_developer: 'Full Stack Developer',
  data_analyst: 'Data Analyst',
  software_engineer: 'Software Engineer',
};

const TYPE_LABELS = {
  hr: 'HR / Behavioral',
  technical: 'Technical Concepts',
  dsa: 'Data Structures & Algorithms',
  project_based: 'Project-Based / Experience',
};

/**
 * Generates interview questions using Gemini.
 * @param {object} params
 * @param {string} params.role - target_role enum value
 * @param {string} params.difficulty - difficulty_level enum value
 * @param {string[]} params.questionTypes - array of question_type enum values
 * @param {number} params.count - number of questions to generate
 * @returns {Promise<Array<{question, expected_answer, difficulty, topic, question_type}>>}
 */
export const generateInterviewQuestions = async ({ role, difficulty, questionTypes, count = 5 }) => {
  const roleLabel = ROLE_LABELS[role] || role;
  const typeLabels = questionTypes.map((t) => TYPE_LABELS[t] || t).join(', ');

  const prompt = `
You are an expert technical interviewer creating interview questions for a ${roleLabel} candidate.

Generate exactly ${count} interview questions with the following constraints:
- Difficulty level: ${difficulty}
- Question types to use (mix evenly across these): ${typeLabels}
- Questions should be realistic, commonly asked in real interviews, and appropriate for the difficulty level.

Return ONLY a JSON object with this exact structure (no markdown, no commentary):

{
  "questions": [
    {
      "question": "the interview question text",
      "expected_answer": "a model/expected answer covering key points (3-6 sentences)",
      "difficulty": "${difficulty}",
      "topic": "short topic name e.g. 'React Hooks', 'Binary Trees', 'Team Conflict'",
      "question_type": "one of: hr, technical, dsa, project_based"
    }
  ]
}
`;

  const result = await generateJSON(prompt, { temperature: 0.8 });

  if (!Array.isArray(result.questions)) {
    throw new Error('Gemini did not return a valid questions array');
  }

  return result.questions.map((q) => ({
    question: q.question,
    expected_answer: q.expected_answer,
    difficulty: q.difficulty || difficulty,
    topic: q.topic || '',
    question_type: questionTypes.includes(q.question_type) ? q.question_type : questionTypes[0],
  }));
};
