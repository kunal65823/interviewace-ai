import express from 'express';
import {
  getPlatformStats,
  listUsers,
  listAllInterviews,
  updateUserRole,
  listAdminLogs,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', listUsers);
router.get('/interviews', listAllInterviews);
router.put('/users/:id/role', updateUserRole);
router.get('/logs', listAdminLogs);

export default router;
