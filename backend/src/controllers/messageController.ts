import { Response } from 'express';
import { prisma } from '../config/db';
import { formatMessage } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';
import { SocketService } from '../services/socketService';

export async function getTeamMessages(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { teamId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const isMember = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!isMember && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, data: null, message: 'Only team members can access team chat.' });
    }

    const messages = await prisma.message.findMany({
      where: { teamId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });

    return res.status(200).json({
      success: true,
      data: messages.map(formatMessage),
      message: 'Team messages retrieved successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch team messages.',
    });
  }
}

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const senderId = req.user?.id;
    const { teamId, content, type } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    if (!teamId || !content) {
      return res.status(400).json({ success: false, data: null, message: 'Team ID and content are required.' });
    }

    const message = await prisma.message.create({
      data: {
        teamId,
        senderId,
        content,
        type: type || 'text',
      },
      include: { sender: true },
    });

    const formatted = formatMessage(message);

    // Broadcast message via WebSockets
    SocketService.sendMessageToTeam(teamId, formatted);

    return res.status(201).json({
      success: true,
      data: formatted,
      message: 'Message sent successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to send message.',
    });
  }
}
