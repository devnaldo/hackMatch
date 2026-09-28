import { Router } from 'express';
import { getTeamMessages, sendMessage } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /messages/team/{teamId}:
 *   get:
 *     summary: Get team chat messages history
 *     tags: [Messages & Chat]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/team/:teamId', authenticateToken, getTeamMessages);

/**
 * @openapi
 * /messages:
 *   post:
 *     summary: Send chat message to team and broadcast via WebSockets
 *     tags: [Messages & Chat]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', authenticateToken, sendMessage);

export default router;
