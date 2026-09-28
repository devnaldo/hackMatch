import { Router } from 'express';
import { getUsers, getUserById, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users with pagination and skill/experience filters
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: skill
 *         schema: { type: string }
 *       - in: query
 *         name: experience
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: List of users }
 */
router.get('/', getUsers);

/**
 * @openapi
 * /users/profile:
 *   put:
 *     summary: Update profile of authenticated user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile updated successfully }
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User details }
 */
router.get('/:id', getUserById);

export default router;
