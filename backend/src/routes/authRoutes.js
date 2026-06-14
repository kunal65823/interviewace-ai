import express from 'express';
import {
  signup,
  login,
  googleAuthUrl,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuthUrl);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);

export default router;
