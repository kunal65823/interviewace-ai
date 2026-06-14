import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/admin/stats
 * Platform-wide statistics for the admin dashboard cards.
 */
export const getPlatformStats = asyncHandler(async (req, res) => {
  const { data: stats, error: statsError } = await supabaseAdmin
    .from('admin_platform_stats')
    .select('*')
    .single();

  if (statsError) throw new AppError(statsError.message, 500);

  const { data: popularRoles, error: rolesError } = await supabaseAdmin
    .from('admin_popular_roles')
    .select('*')
    .limit(5);

  if (rolesError) throw new AppError(rolesError.message, 500);

  // Daily active users: distinct users with sessions started today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: dauRows, error: dauError } = await supabaseAdmin
    .from('interview_sessions')
    .select('user_id')
    .gte('started_at', todayStart.toISOString());

  if (dauError) throw new AppError(dauError.message, 500);

  const dailyActiveUsers = new Set((dauRows || []).map((r) => r.user_id)).size;

  res.json({
    success: true,
    data: {
      totalUsers: stats.total_users,
      totalInterviews: stats.total_interviews,
      averagePlatformScore: stats.average_platform_score,
      dailyActiveUsers,
      mostPopularRoles: popularRoles,
    },
  });
});

/**
 * GET /api/admin/users
 * Query: page?, limit?, search?
 * Returns paginated list of users with profile + progress info.
 */
export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const search = req.query.search;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, target_role, current_skill_level, created_at, user_progress(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  res.json({
    success: true,
    data: {
      users: data,
      pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) },
    },
  });
});

/**
 * GET /api/admin/interviews
 * Query: page?, limit?, status?, role?
 * Returns paginated list of all interview sessions across the platform.
 */
export const listAllInterviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('interview_sessions')
    .select('*, profiles(full_name), feedback_reports(overall_score)', { count: 'exact' })
    .order('started_at', { ascending: false })
    .range(from, to);

  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.role) query = query.eq('role', req.query.role);

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  res.json({
    success: true,
    data: {
      interviews: data,
      pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) },
    },
  });
});

/**
 * PUT /api/admin/users/:id/role
 * Body: { role: 'candidate' | 'admin' }
 * Updates a user's role. Logs the action.
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['candidate', 'admin'].includes(role)) throw new AppError('Invalid role', 400);

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  await supabaseAdmin.from('admin_logs').insert({
    admin_id: req.user.id,
    action: 'update_user_role',
    target_table: 'profiles',
    target_id: id,
    details: { new_role: role },
  });

  res.json({ success: true, message: 'User role updated', data: { profile: data } });
});

/**
 * GET /api/admin/logs
 * Returns recent admin action logs.
 */
export const listAdminLogs = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('admin_logs')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { logs: data } });
});
