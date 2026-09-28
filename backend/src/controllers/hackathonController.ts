import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { formatHackathon } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';

export async function getHackathons(req: Request, res: Response) {
  try {
    const { search, mode, active } = req.query;

    const where: any = {};
    if (active === 'true') {
      where.isActive = true;
    }

    if (mode) {
      where.mode = mode as string;
    }

    if (search) {
      const q = search as string;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { organizer: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const hackathons = await prisma.hackathon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: hackathons.map(formatHackathon),
      message: 'Hackathons retrieved successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch hackathons.',
    });
  }
}

export async function getHackathonById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      return res.status(404).json({ success: false, data: null, message: 'Hackathon not found.' });
    }

    return res.status(200).json({
      success: true,
      data: formatHackathon(hackathon),
      message: 'Hackathon details retrieved.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch hackathon.',
    });
  }
}

export async function createHackathon(req: AuthRequest, res: Response) {
  try {
    const { title, organizer, description, date, registrationDeadline, location, mode, prizePool, minTeamSize, maxTeamSize, tags, registrationLink, rules } = req.body;

    if (!title || !organizer || !description || !date || !registrationDeadline || !location) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title, organizer, description, date, registration deadline, and location are required.',
      });
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        title,
        organizer,
        description,
        date,
        registrationDeadline,
        location,
        mode: mode || 'online',
        prizePool: prizePool || '$0',
        minTeamSize: minTeamSize ? parseInt(minTeamSize, 10) : 1,
        maxTeamSize: maxTeamSize ? parseInt(maxTeamSize, 10) : 4,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        registrationLink: registrationLink || '',
        rules: rules || '',
      },
    });

    return res.status(201).json({
      success: true,
      data: formatHackathon(hackathon),
      message: 'Hackathon created successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to create hackathon.',
    });
  }
}

export async function registerForHackathon(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const hackathon = await prisma.hackathon.findUnique({ where: { id } });
    if (!hackathon) {
      return res.status(404).json({ success: false, data: null, message: 'Hackathon not found.' });
    }

    const existing = await prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: id,
          userId,
        },
      },
    });

    if (existing) {
      // Unregister if toggling
      await prisma.hackathonParticipant.delete({
        where: {
          hackathonId_userId: {
            hackathonId: id,
            userId,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: { isRegistered: false },
        message: 'Registration cancelled.',
      });
    }

    await prisma.hackathonParticipant.create({
      data: {
        hackathonId: id,
        userId,
      },
    });

    return res.status(200).json({
      success: true,
      data: { isRegistered: true },
      message: 'Registered for hackathon successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to register for hackathon.',
    });
  }
}
