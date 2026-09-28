import { Router } from 'express';
import { getTeammateMatches, getTeamRecommendations } from '../controllers/matchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /matches/teammates:
 *   get:
 *     summary: Get recommended teammate matches based on skill overlap & college
 *     tags: [Matching & Recommendations]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/teammates', authenticateToken, getTeammateMatches);

/**
 * @openapi
 * /matches/teams:
 *   get:
 *     summary: Get recommended team matches based on user skills & team requirements
 *     tags: [Matching & Recommendations]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/teams', authenticateToken, getTeamRecommendations);

export default router;
