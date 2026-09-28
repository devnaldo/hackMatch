import { Router } from 'express';
import { register, login, getCurrentUser, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, college]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               college: { type: string }
 *               branch: { type: string }
 *               bio: { type: string }
 *               skills: { type: array, items: { type: string } }
 *               experience: { type: string, enum: [beginner, intermediate, advanced] }
 *     responses:
 *       201: { description: User registered successfully }
 */
router.post('/register', authRateLimiter, register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user & get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 */
router.post('/login', authRateLimiter, login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile data }
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @openapi
 * /auth/password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Password updated }
 */
router.put('/password', authenticateToken, changePassword);

export default router;
