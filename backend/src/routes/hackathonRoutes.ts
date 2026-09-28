import { Router } from 'express';
import { getHackathons, getHackathonById, createHackathon, registerForHackathon } from '../controllers/hackathonController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /hackathons:
 *   get:
 *     summary: List all hackathons
 *     tags: [Hackathons]
 *   post:
 *     summary: Create new hackathon (Admin only)
 *     tags: [Hackathons]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', getHackathons);
router.post('/', authenticateToken, requireRole('admin'), createHackathon);

/**
 * @openapi
 * /hackathons/{id}:
 *   get:
 *     summary: Get hackathon details by ID
 *     tags: [Hackathons]
 */
router.get('/:id', getHackathonById);

/**
 * @openapi
 * /hackathons/{id}/register:
 *   post:
 *     summary: Register or toggle interest for a hackathon
 *     tags: [Hackathons]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/register', authenticateToken, registerForHackathon);

export default router;
