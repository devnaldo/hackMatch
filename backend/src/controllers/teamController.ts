import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { cache } from '../config/redis';
import { formatTeam, formatUser } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';
import { SocketService } from '../services/socketService';

export async function getTeams(req: Request, res: Response) {
  try {
    const { search, skill, hackathonId, status, page = '1', limit = '12' } = req.query;

    const cacheKey = `teams_query:${search || ''}:${skill || ''}:${hackathonId || ''}:${status || ''}:${page}:${limit}`;

    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (hackathonId) {
      where.hackathonId = hackathonId as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (search) {
      const q = search as string;
      where.OR = [
        { teamName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { projectIdea: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          leader: true,
          members: {
            include: { user: true },
          },
          hackathon: true,
        },
      }),
      prisma.team.count({ where }),
    ]);

    let formattedTeams = teams.map(formatTeam);

    if (skill) {
      const targetSkill = (skill as string).toLowerCase();
      formattedTeams = formattedTeams.filter((t) =>
        t?.requiredSkills.some((s: string) => s.toLowerCase().includes(targetSkill))
      );
    }

    const responsePayload = {
      success: true,
      data: {
        teams: formattedTeams,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: 'Teams retrieved successfully.',
    };

    await cache.set(cacheKey, responsePayload, 30); // Cache for 30s

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch teams.',
    });
  }
}

export async function getTeamById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        leader: true,
        members: {
          include: { user: true },
        },
        hackathon: true,
      },
    });

    if (!team) {
      return res.status(404).json({ success: false, data: null, message: 'Team not found.' });
    }

    return res.status(200).json({
      success: true,
      data: formatTeam(team),
      message: 'Team details retrieved.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch team.',
    });
  }
}

export async function createTeam(req: AuthRequest, res: Response) {
  try {
    const leaderId = req.user?.id;
    if (!leaderId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const { teamName, description, requiredSkills, maxSize, hackathonId, projectIdea, tags } = req.body;

    if (!teamName || !description) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Team name and description are required.',
      });
    }

    const team = await prisma.team.create({
      data: {
        teamName,
        description,
        leaderId,
        requiredSkills: JSON.stringify(Array.isArray(requiredSkills) ? requiredSkills : []),
        maxSize: maxSize ? parseInt(maxSize, 10) : 4,
        hackathonId: hackathonId || null,
        projectIdea: projectIdea || '',
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        members: {
          create: {
            userId: leaderId,
          },
        },
      },
      include: {
        leader: true,
        members: {
          include: { user: true },
        },
        hackathon: true,
      },
    });

    await cache.delPattern('teams_query');

    return res.status(201).json({
      success: true,
      data: formatTeam(team),
      message: 'Team created successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to create team.',
    });
  }
}

export async function updateTeam(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ success: false, data: null, message: 'Team not found.' });
    }

    if (team.leaderId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, data: null, message: 'Only team leader or admin can edit team.' });
    }

    const { teamName, description, requiredSkills, maxSize, status, projectIdea, tags } = req.body;

    const updateData: any = {};
    if (teamName !== undefined) updateData.teamName = teamName;
    if (description !== undefined) updateData.description = description;
    if (requiredSkills !== undefined) updateData.requiredSkills = JSON.stringify(Array.isArray(requiredSkills) ? requiredSkills : []);
    if (maxSize !== undefined) updateData.maxSize = parseInt(maxSize, 10);
    if (status !== undefined) updateData.status = status;
    if (projectIdea !== undefined) updateData.projectIdea = projectIdea;
    if (tags !== undefined) updateData.tags = JSON.stringify(Array.isArray(tags) ? tags : []);

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updateData,
      include: {
        leader: true,
        members: { include: { user: true } },
        hackathon: true,
      },
    });

    await cache.delPattern('teams_query');

    return res.status(200).json({
      success: true,
      data: formatTeam(updatedTeam),
      message: 'Team updated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to update team.',
    });
  }
}

export async function deleteTeam(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ success: false, data: null, message: 'Team not found.' });
    }

    if (team.leaderId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, data: null, message: 'Only team leader or admin can delete team.' });
    }

    await prisma.team.delete({ where: { id } });
    await cache.delPattern('teams_query');

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Team deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to delete team.',
    });
  }
}

export async function joinTeam(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!team) {
      return res.status(404).json({ success: false, data: null, message: 'Team not found.' });
    }

    if (team.members.length >= team.maxSize) {
      return res.status(400).json({ success: false, data: null, message: 'Team is already full.' });
    }

    const alreadyMember = team.members.some((m) => m.userId === userId);
    if (alreadyMember) {
      return res.status(400).json({ success: false, data: null, message: 'You are already a member of this team.' });
    }

    await prisma.teamMember.create({
      data: {
        teamId: id,
        userId,
      },
    });

    if (team.members.length + 1 >= team.maxSize) {
      await prisma.team.update({
        where: { id },
        data: { status: 'full' },
      });
    }

    await cache.delPattern('teams_query');

    const updatedTeam = await prisma.team.findUnique({
      where: { id },
      include: {
        leader: true,
        members: { include: { user: true } },
        hackathon: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: formatTeam(updatedTeam),
      message: 'Joined team successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to join team.',
    });
  }
}

export async function leaveTeam(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: id,
          userId,
        },
      },
    });

    if (!teamMember) {
      return res.status(400).json({ success: false, data: null, message: 'You are not a member of this team.' });
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: id,
          userId,
        },
      },
    });

    await prisma.team.update({
      where: { id },
      data: { status: 'open' },
    });

    await cache.delPattern('teams_query');

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Left team successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to leave team.',
    });
  }
}
