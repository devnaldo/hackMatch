import { Response } from 'express';
import { prisma } from '../config/db';
import { RecommendationEngine } from '../services/matchingService';
import { formatTeam, formatUser, parseJsonArray } from '../utils/formatters';
import { AuthRequest } from '../middleware/auth';

export async function getTeammateMatches(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return res.status(404).json({ success: false, data: null, message: 'User not found.' });
    }

    const userSkills = parseJsonArray(currentUser.skills);

    const candidateUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        isBanned: false,
        isAvailable: true,
      },
      include: {
        teamMemberships: true,
        hackathonRegistrations: true,
        badges: true,
      },
      take: 50,
    });

    const matches = candidateUsers.map((candidate) => {
      const candidateSkills = parseJsonArray(candidate.skills);
      const score = RecommendationEngine.calculateTeammateMatchScore(
        userSkills,
        candidateSkills,
        currentUser.college,
        candidate.college
      );

      return {
        user: formatUser(candidate),
        compatibilityScore: score,
      };
    });

    // Sort by compatibility score descending
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.status(200).json({
      success: true,
      data: matches,
      message: 'Teammate recommendations generated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to generate matches.',
    });
  }
}

export async function getTeamRecommendations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return res.status(404).json({ success: false, data: null, message: 'User not found.' });
    }

    const userSkills = parseJsonArray(currentUser.skills);

    const openTeams = await prisma.team.findMany({
      where: {
        status: 'open',
      },
      include: {
        leader: true,
        members: { include: { user: true } },
        hackathon: true,
      },
      take: 50,
    });

    const recommendations = openTeams
      .filter((t) => !t.members.some((m) => m.userId === userId))
      .map((team) => {
        const reqSkills = parseJsonArray(team.requiredSkills);
        const score = RecommendationEngine.calculateTeamUserMatchScore(
          userSkills,
          currentUser.experience,
          reqSkills
        );

        return {
          team: formatTeam(team),
          compatibilityScore: score,
        };
      });

    recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.status(200).json({
      success: true,
      data: recommendations,
      message: 'Team recommendations generated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to generate team recommendations.',
    });
  }
}
