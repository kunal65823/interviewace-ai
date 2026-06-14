import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/notifications
 */
export const listNotifications = asyncHandler(async (req, res) => {
  const { data, error } = await req.supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { notifications: data } });
});

/**
 * PUT /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await req.supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, data: { notification: data } });
});

/**
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const { error } = await req.supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  if (error) throw new AppError(error.message, 500);

  res.json({ success: true, message: 'All notifications marked as read' });
});
