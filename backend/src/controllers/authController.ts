import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { formatUser } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_and_make_sure_it_is_long_enough_to_be_secure_256_bits';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, college, branch, bio, skills, experience, githubUrl, linkedinUrl, portfolioUrl } = req.body;

    if (!name || !email || !password || !college) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name, email, password, and college are required fields.',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A user with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        college,
        branch: branch || '',
        bio: bio || '',
        skills: skillsJson,
        experience: experience || 'beginner',
        githubUrl: githubUrl || '',
        linkedinUrl: linkedinUrl || '',
        portfolioUrl: portfolioUrl || '',
      },
      include: {
        teamMemberships: true,
        hackathonRegistrations: true,
        badges: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: formatUser(user),
      },
      message: 'User registered successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Registration failed.',
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email and password are required.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teamMemberships: true,
        hackathonRegistrations: true,
        badges: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password.',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Your account has been banned. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: formatUser(user),
      },
      message: 'Login successful.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Login failed.',
    });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMemberships: true,
        hackathonRegistrations: true,
        badges: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, data: null, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: formatUser(user),
      message: 'User profile retrieved successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to retrieve profile.',
    });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Current password and new password are required.',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, data: null, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Incorrect current password.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Password updated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to change password.',
    });
  }
}
