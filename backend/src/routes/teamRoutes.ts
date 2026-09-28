import { Router } from 'express';
import { getTeams, getTeamById, createTeam, updateTeam, deleteTeam, joinTeam, leaveTeam } from '../controllers/teamController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /teams:
 *   get:
 *     summary: List teams with Redis caching, pagination, search, and skill filters
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: skill
 *         schema: { type: string }
 *       - in: query
 *         name: hackathonId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, full, closed] }
 *     responses:
 *       200: { description: List of teams }
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Team created }
 */
router.get('/', getTeams);
router.post('/', authenticateToken, createTeam);

/**
 * @openapi
 * /teams/{id}:
 *   get:
 *     summary: Get team details
 *     tags: [Teams]
 *   put:
 *     summary: Update team details
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete team
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', getTeamById);
router.put('/:id', authenticateToken, updateTeam);
router.delete('/:id', authenticateToken, deleteTeam);

/**
 * @openapi
 * /teams/{id}/join:
 *   post:
 *     summary: Join a team directly
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/join', authenticateToken, joinTeam);

/**
 * @openapi
 * /teams/{id}/leave:
 *   post:
 *     summary: Leave a team
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/leave', authenticateToken, leaveTeam);

export default router;
