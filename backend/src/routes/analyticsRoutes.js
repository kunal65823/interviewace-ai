import express from 'express';
import { getOverview, getTrends } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/trends', getTrends);

export default router;
