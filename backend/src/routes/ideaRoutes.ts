import { Router } from 'express';
import { getProjectIdeas, createProjectIdea, upvoteIdea } from '../controllers/ideaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /ideas:
 *   get:
 *     summary: List project ideas with optional domain filter
 *     tags: [Project Ideas]
 *   post:
 *     summary: Submit new project idea
 *     tags: [Project Ideas]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', getProjectIdeas);
router.post('/', authenticateToken, createProjectIdea);

/**
 * @openapi
 * /ideas/{id}/like:
 *   post:
 *     summary: Toggle upvote on a project idea
 *     tags: [Project Ideas]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/like', authenticateToken, upvoteIdea);

export default router;
