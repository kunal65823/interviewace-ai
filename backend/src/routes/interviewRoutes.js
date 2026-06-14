import express from 'express';
import {
  generateQuestions,
  listQuestions,
  startSession,
  saveAnswer,
  completeSession,
  listSessions,
  getSessionDetails,
} from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Question generation & retrieval
router.post('/questions/generate', generateQuestions);
router.get('/questions', listQuestions);

// Session lifecycle
router.post('/sessions', startSession);
router.get('/sessions', listSessions);
router.get('/sessions/:id', getSessionDetails);
router.put('/sessions/:id/answers/:questionId', saveAnswer);
router.post('/sessions/:id/complete', completeSession);

export default router;
