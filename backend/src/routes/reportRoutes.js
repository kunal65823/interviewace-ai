import express from 'express';
import { listReports, downloadReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listReports);
router.get('/:id/download', downloadReport);

export default router;
