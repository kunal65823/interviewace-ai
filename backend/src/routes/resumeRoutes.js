import express from 'express';
import {
  uploadAndAnalyzeResume,
  getResumes,
  getResumeAnalysis,
  deleteResume,
} from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.post('/upload', uploadResume, uploadAndAnalyzeResume);
router.get('/', getResumes);
router.get('/:id/analysis', getResumeAnalysis);
router.delete('/:id', deleteResume);

export default router;
