import { Response } from 'express';
import { prisma } from '../config/db';
import { formatUser } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';

export async function getAdminStats(req: AuthRequest, res: Response) {
  try {
    const [totalUsers, totalTeams, totalHackathons, totalIdeas, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.hackathon.count(),
      prisma.projectIdea.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          teamMemberships: true,
          hackathonRegistrations: true,
          badges: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalTeams,
          totalHackathons,
          totalIdeas,
        },
        recentUsers: recentUsers.map(formatUser),
      },
      message: 'Admin dashboard statistics retrieved successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch admin stats.',
    });
  }
}

export async function toggleUserBan(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, data: null, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, data: null, message: 'Cannot ban admin user.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBanned: !user.isBanned },
      include: {
        teamMemberships: true,
        hackathonRegistrations: true,
        badges: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: formatUser(updated),
      message: `User ${updated.isBanned ? 'banned' : 'unbanned'} successfully.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to toggle ban status.',
    });
  }
}
