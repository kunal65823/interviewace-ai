import { generateJSON } from '../config/gemini.js';

/**
 * Generates a personalized learning roadmap using Gemini.
 * @param {object} params
 * @param {string} params.desiredRole - target_role enum value
 * @param {string} params.currentSkillLevel - difficulty_level enum value
 * @returns {Promise<object>} roadmap data
 */
export const generateLearningRoadmap = async ({ desiredRole, currentSkillLevel }) => {
  const prompt = `
You are a career mentor creating a personalized learning roadmap.

Candidate's desired role: ${desiredRole.replace(/_/g, ' ')}
Candidate's current skill level: ${currentSkillLevel}

Create a structured learning roadmap and return ONLY a JSON object with this exact structure
(no markdown, no commentary):

{
  "skills_to_learn": ["array of 5-10 specific skills, ordered by priority"],
  "recommended_technologies": ["array of 5-10 specific tools/frameworks/languages"],
  "suggested_projects": [
    {"title": "project name", "description": "1-2 sentence description", "difficulty": "beginner|intermediate|advanced"}
  ],
  "weekly_plan": [
    {"week": 1, "focus": "topic/skill focus for the week", "tasks": ["array of 2-4 specific tasks"]}
  ],
  "estimated_timeline_weeks": <integer total weeks to reach job-ready level for this role from current level>
}

Generate 3-5 suggested projects and a weekly_plan covering the full estimated_timeline_weeks
(if more than 8 weeks, you may group multiple weeks per entry using a "week" range string like "1-2").
`;

  const result = await generateJSON(prompt, { temperature: 0.6 });

  return {
    skills_to_learn: result.skills_to_learn || [],
    recommended_technologies: result.recommended_technologies || [],
    suggested_projects: result.suggested_projects || [],
    weekly_plan: result.weekly_plan || [],
    estimated_timeline_weeks:
      typeof result.estimated_timeline_weeks === 'number' ? result.estimated_timeline_weeks : 12,
  };
};
