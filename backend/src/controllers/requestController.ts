import { Response } from 'express';
import { prisma } from '../config/db';
import { formatTeamRequest, formatUser } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';
import { SocketService } from '../services/socketService';

export async function createRequest(req: AuthRequest, res: Response) {
  try {
    const senderId = req.user?.id;
    const { type, receiverId, teamId, message } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    if (!type || !teamId || !receiverId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Type, receiverId, and teamId are required.',
      });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      return res.status(404).json({ success: false, data: null, message: 'Team not found.' });
    }

    const existingReq = await prisma.teamRequest.findFirst({
      where: {
        senderId,
        receiverId,
        teamId,
        status: 'pending',
      },
    });

    if (existingReq) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A pending request already exists.',
      });
    }

    const teamReq = await prisma.teamRequest.create({
      data: {
        type,
        senderId,
        receiverId,
        teamId,
        message: message || '',
      },
      include: {
        sender: true,
        receiver: true,
        team: {
          include: { leader: true, members: { include: { user: true } }, hackathon: true },
        },
      },
    });

    const senderUser = await prisma.user.findUnique({ where: { id: senderId } });

    // Send Notification
    const notifText =
      type === 'join_request'
        ? `${senderUser?.name} requested to join team ${team.teamName}`
        : `${senderUser?.name} invited you to join team ${team.teamName}`;

    const notification = await prisma.notification.create({
      data: {
        userId: receiverId,
        text: notifText,
        type,
      },
    });

    SocketService.sendNotificationToUser(receiverId, notification);

    return res.status(201).json({
      success: true,
      data: formatTeamRequest(teamReq),
      message: 'Request created successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to create request.',
    });
  }
}

export async function getUserRequests(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const requests = await prisma.teamRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: true,
        receiver: true,
        team: {
          include: { leader: true, members: { include: { user: true } }, hackathon: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: requests.map(formatTeamRequest),
      message: 'Team requests retrieved successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch requests.',
    });
  }
}

export async function respondToRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Action must be accept or reject.',
      });
    }

    const teamReq = await prisma.teamRequest.findUnique({
      where: { id },
      include: {
        team: { include: { members: true } },
        sender: true,
        receiver: true,
      },
    });

    if (!teamReq) {
      return res.status(404).json({ success: false, data: null, message: 'Request not found.' });
    }

    if (teamReq.receiverId !== userId && teamReq.senderId !== userId) {
      return res.status(403).json({ success: false, data: null, message: 'Not authorized to respond to this request.' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    const updatedReq = await prisma.teamRequest.update({
      where: { id },
      data: { status: newStatus },
      include: {
        sender: true,
        receiver: true,
        team: {
          include: { leader: true, members: { include: { user: true } }, hackathon: true },
        },
      },
    });

    if (action === 'accept') {
      const memberUserId = teamReq.type === 'join_request' ? teamReq.senderId : teamReq.receiverId;

      const alreadyMember = teamReq.team.members.some((m) => m.userId === memberUserId);
      if (!alreadyMember) {
        await prisma.teamMember.create({
          data: {
            teamId: teamReq.teamId,
            userId: memberUserId,
          },
        });

        if (teamReq.team.members.length + 1 >= teamReq.team.maxSize) {
          await prisma.team.update({
            where: { id: teamReq.teamId },
            data: { status: 'full' },
          });
        }
      }
    }

    // Send Notification
    const notifReceiver = teamReq.receiverId === userId ? teamReq.senderId : teamReq.receiverId;
    const notifText = `Your ${teamReq.type.replace('_', ' ')} for team ${teamReq.team.teamName} was ${newStatus}`;

    const notification = await prisma.notification.create({
      data: {
        userId: notifReceiver,
        text: notifText,
        type: action === 'accept' ? 'acceptance' : 'rejection',
      },
    });

    SocketService.sendNotificationToUser(notifReceiver, notification);

    return res.status(200).json({
      success: true,
      data: formatTeamRequest(updatedReq),
      message: `Request ${newStatus} successfully.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to respond to request.',
    });
  }
}
