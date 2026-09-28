import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { formatUser } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';

export async function getUsers(req: Request, res: Response) {
  try {
    const { search, skill, experience, available, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isBanned: false,
    };

    if (available === 'true') {
      where.isAvailable = true;
    }

    if (experience) {
      where.experience = experience as string;
    }

    if (search) {
      const q = search as string;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { college: { contains: q, mode: 'insensitive' } },
        { branch: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          teamMemberships: true,
          hackathonRegistrations: true,
          badges: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    let formattedUsers = users.map(formatUser);

    if (skill) {
      const targetSkill = (skill as string).toLowerCase();
      formattedUsers = formattedUsers.filter((u) =>
        u?.skills.some((s: string) => s.toLowerCase().includes(targetSkill))
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: 'Users retrieved successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch users.',
    });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      message: 'User details retrieved.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch user.',
    });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const { name, college, branch, bio, profilePicture, skills, experience, githubUrl, linkedinUrl, portfolioUrl, isAvailable } = req.body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (college !== undefined) dataToUpdate.college = college;
    if (branch !== undefined) dataToUpdate.branch = branch;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (profilePicture !== undefined) dataToUpdate.profilePicture = profilePicture;
    if (skills !== undefined) dataToUpdate.skills = JSON.stringify(Array.isArray(skills) ? skills : []);
    if (experience !== undefined) dataToUpdate.experience = experience;
    if (githubUrl !== undefined) dataToUpdate.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) dataToUpdate.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) dataToUpdate.portfolioUrl = portfolioUrl;
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        teamMemberships: true,
        hackathonRegistrations: true,
        badges: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: formatUser(updatedUser),
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to update profile.',
    });
  }
}
