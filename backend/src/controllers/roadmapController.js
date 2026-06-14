import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { generateLearningRoadmap } from '../services/roadmapService.js';

const VALID_ROLES = ['frontend_developer', 'backend_developer', 'full_stack_developer', 'data_analyst', 'software_engineer'];
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

/**
 * POST /api/roadmaps/generate
 * Body: { desiredRole, currentSkillLevel }
 */
export const generateRoadmap = asyncHandler(async (req, res) => {
  const { desiredRole, currentSkillLevel } = req.body;

  if (!VALID_ROLES.includes(desiredRole)) throw new AppError('Invalid desired role', 400);
  if (!VALID_LEVELS.includes(currentSkillLevel)) throw new AppError('Invalid skill level', 400);

  const roadmap = await generateLearningRoadmap({ desiredRole, currentSkillLevel });

  const { data, error } = await req.supabase
    .from('learning_roadmaps')
    .insert({
      user_id: req.user.id,
      desired_role: desiredRole,
      current_skill_level: currentSkillLevel,
      skills_to_learn: roadmap.skills_to_learn,
      recommended_technologies: roadmap.recommended_technologies,
      suggested_projects: roadmap.suggested_projects,
      weekly_plan: roadmap.weekly_plan,
      estimated_timeline_weeks: roadmap.estimated_timeline_weeks,
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  // Notify user
  await req.supabase.from('notifications').insert({
    user_id: req.user.id,
    type: 'roadmap',
    title: 'New Learning Roadmap Generated',
    message: `Your personalized roadmap for ${desiredRole.replace(/_/g, ' ')} is ready.`,
    metadata: { roadmap_id: data.id },
  });

  res.status(201).json({ success: true, data: { roadmap: data } });
});

/**
 * GET /api/roadmaps
 * Returns the user's roadmap history.
 */
export const listRoadmaps = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('learning_roadmaps')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { roadmaps: data } });
});

/**
 * GET /api/roadmaps/:id
 */
export const getRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await req.supabase
    .from('learning_roadmaps')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error) throw new AppError('Roadmap not found', 404);

  res.json({ success: true, data: { roadmap: data } });
});
