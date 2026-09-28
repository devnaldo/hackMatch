import { Router } from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List notifications for current user
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authenticateToken, getUserNotifications);

/**
 * @openapi
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/read-all', authenticateToken, markAllAsRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark single notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id/read', authenticateToken, markAsRead);

export default router;
