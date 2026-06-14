import express from 'express';
import { generateRoadmap, listRoadmaps, getRoadmap } from '../controllers/roadmapController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/generate', generateRoadmap);
router.get('/', listRoadmaps);
router.get('/:id', getRoadmap);

export default router;
