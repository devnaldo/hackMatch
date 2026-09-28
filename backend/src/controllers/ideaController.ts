import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { formatProjectIdea, parseJsonArray } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';

export async function getProjectIdeas(req: Request, res: Response) {
  try {
    const { domain, search } = req.query;

    const where: any = {};

    if (domain) {
      where.domain = domain as string;
    }

    if (search) {
      const q = search as string;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const ideas = await prisma.projectIdea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { submittedBy: true },
    });

    return res.status(200).json({
      success: true,
      data: ideas.map(formatProjectIdea),
      message: 'Project ideas retrieved successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch project ideas.',
    });
  }
}

export async function createProjectIdea(req: AuthRequest, res: Response) {
  try {
    const submittedById = req.user?.id;
    const { title, domain, description, tags } = req.body;

    if (!submittedById) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    if (!title || !domain || !description) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title, domain, and description are required.',
      });
    }

    const idea = await prisma.projectIdea.create({
      data: {
        title,
        domain,
        description,
        submittedById,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        upvotes: JSON.stringify([submittedById]),
      },
      include: { submittedBy: true },
    });

    return res.status(201).json({
      success: true,
      data: formatProjectIdea(idea),
      message: 'Project idea submitted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to create project idea.',
    });
  }
}

export async function upvoteIdea(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const idea = await prisma.projectIdea.findUnique({ where: { id } });
    if (!idea) {
      return res.status(404).json({ success: false, data: null, message: 'Project idea not found.' });
    }

    let upvotes = parseJsonArray(idea.upvotes);
    if (upvotes.includes(userId)) {
      upvotes = upvotes.filter((u) => u !== userId);
    } else {
      upvotes.push(userId);
    }

    const updated = await prisma.projectIdea.update({
      where: { id },
      data: { upvotes: JSON.stringify(upvotes) },
      include: { submittedBy: true },
    });

    return res.status(200).json({
      success: true,
      data: formatProjectIdea(updated),
      message: 'Upvote toggled.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to upvote idea.',
    });
  }
}
