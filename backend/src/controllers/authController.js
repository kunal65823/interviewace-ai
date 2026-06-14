import { supabaseAdmin, getUserScopedClient } from '../config/supabase.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * POST /api/auth/signup
 * Body: { email, password, fullName }
 */
export const signup = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || '' },
      emailRedirectTo: `${process.env.FRONTEND_URL}/login`,
    },
  });

  if (error) throw new AppError(error.message, 400);

  res.status(201).json({
    success: true,
    message: 'Signup successful. Please check your email to confirm your account.',
    data: { user: data.user },
  });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const client = getUserScopedClient(null);
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) throw new AppError(error.message, 401);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: data.user,
      session: data.session,
    },
  });
});

/**
 * POST /api/auth/google
 * Body: { redirectTo? }
 * Returns the OAuth URL for the frontend to redirect to.
 */
export const googleAuthUrl = asyncHandler(async (req, res) => {
  const redirectTo = req.body.redirectTo || `${process.env.FRONTEND_URL}/dashboard`;

  const client = getUserScopedClient(null);
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) throw new AppError(error.message, 400);

  res.json({ success: true, data: { url: data.url } });
});

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new AppError('Email is required', 400);

  const client = getUserScopedClient(null);
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  });

  if (error) throw new AppError(error.message, 400);

  res.json({ success: true, message: 'Password reset email sent if the account exists.' });
});

/**
 * POST /api/auth/reset-password
 * Body: { accessToken, newPassword }
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { accessToken, newPassword } = req.body;

  if (!accessToken || !newPassword) {
    throw new AppError('Access token and new password are required', 400);
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) throw new AppError('Invalid or expired token', 401);

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
    password: newPassword,
  });

  if (error) throw new AppError(error.message, 400);

  res.json({ success: true, message: 'Password updated successfully' });
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const client = getUserScopedClient(req.accessToken);
  await client.auth.signOut();
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Requires authentication. Returns the current user's profile.
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) throw new AppError('Profile not found', 404);

  res.json({
    success: true,
    data: {
      user: { id: req.user.id, email: req.user.email },
      profile,
    },
  });
});

/**
 * PUT /api/auth/profile
 * Requires authentication. Updates the user's profile.
 * Body: { fullName?, bio?, targetRole?, currentSkillLevel?, avatarUrl? }
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, targetRole, currentSkillLevel, avatarUrl } = req.body;

  const updates = {};
  if (fullName !== undefined) updates.full_name = fullName;
  if (bio !== undefined) updates.bio = bio;
  if (targetRole !== undefined) updates.target_role = targetRole;
  if (currentSkillLevel !== undefined) updates.current_skill_level = currentSkillLevel;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

  const { data, error } = await req.supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);

  res.json({ success: true, message: 'Profile updated successfully', data: { profile: data } });
});
