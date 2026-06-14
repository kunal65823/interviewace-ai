import { supabaseAdmin, getUserScopedClient } from '../config/supabase.js';

/**
 * Middleware: verifies the Supabase access token sent in the Authorization header.
 * Attaches `req.user` (Supabase user object) and `req.supabase` (user-scoped client)
 * to the request for downstream handlers.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = data.user;
    req.accessToken = token;
    req.supabase = getUserScopedClient(token);

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Middleware: ensures the authenticated user has the 'admin' role.
 * Must be used AFTER `authenticate`.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ success: false, message: 'Profile not found' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.userRole = profile.role;
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    return res.status(500).json({ success: false, message: 'Authorization error' });
  }
};
