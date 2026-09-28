import { Router } from 'express';
import { getAdminStats, toggleUserBan } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Get platform analytics stats (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/stats', authenticateToken, requireRole('admin'), getAdminStats);

/**
 * @openapi
 * /admin/users/{id}/ban:
 *   put:
 *     summary: Ban or unban a user (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/users/:id/ban', authenticateToken, requireRole('admin'), toggleUserBan);

export default router;
