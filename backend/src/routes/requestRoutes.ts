import { Router } from 'express';
import { createRequest, getUserRequests, respondToRequest } from '../controllers/requestController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /requests:
 *   get:
 *     summary: Get all join requests and invitations for current user
 *     tags: [Team Requests]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Send a join request or invitation
 *     tags: [Team Requests]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authenticateToken, getUserRequests);
router.post('/', authenticateToken, createRequest);

/**
 * @openapi
 * /requests/{id}/respond:
 *   put:
 *     summary: Respond to a join request or invitation (accept / reject)
 *     tags: [Team Requests]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id/respond', authenticateToken, respondToRequest);

export default router;
