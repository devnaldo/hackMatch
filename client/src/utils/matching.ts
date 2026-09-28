import { User } from '../types';

/**
 * Calculates compatibility score between userA and userB on the frontend.
 */
export const calculateCompatibility = (userA: User, userB: User): number => {
  if (!userA || !userB) return 0;
  if (userA._id === userB._id) return 0;

  const skillsA = userA.skills || [];
  const skillsB = userB.skills || [];

  // 1. Skill Complementarity (Max 40 pts)
  let skillComplementarityPoints = 0;
  if (skillsB.length > 0) {
    const uniqueSkillsB = skillsB.filter(skill => !skillsA.includes(skill)).length;
    skillComplementarityPoints = (uniqueSkillsB / skillsB.length) * 40;
  }

  // 2. Shared Interests / Tags (Max 20 pts)
  let sharedInterestsPoints = 0;
  const maxSkillsLength = Math.max(skillsA.length, skillsB.length);
  if (maxSkillsLength > 0) {
    const overlap = skillsA.filter(skill => skillsB.includes(skill)).length;
    sharedInterestsPoints = (overlap / maxSkillsLength) * 20;
  }

  // 3. Experience Match (Max 20 pts)
  const expMap = { beginner: 1, intermediate: 2, advanced: 3 };
  const expA = expMap[userA.experience] || 1;
  const expB = expMap[userB.experience] || 1;
  const diff = Math.abs(expA - expB);
  let experiencePoints = 0;
  if (diff === 0) {
    experiencePoints = 20;
  } else if (diff === 1) {
    experiencePoints = 12;
  } else {
    experiencePoints = 5;
  }

  // 4. Profile Completeness (Max 10 pts)
  let profilePoints = 0;
  if (userA.githubUrl && userB.githubUrl) profilePoints += 5;
  if (userA.linkedinUrl && userB.linkedinUrl) profilePoints += 3;
  if (userA.bio && userB.bio) profilePoints += 2;

  // 5. Availability Bonus (Max 10 pts)
  const availabilityPoints = (userA.isAvailable && userB.isAvailable) ? 10 : 0;

  const totalScore = skillComplementarityPoints + sharedInterestsPoints + experiencePoints + profilePoints + availabilityPoints;
  return Math.round(totalScore);
};

/**
 * Calculates average compatibility score between a user and a team of members on the frontend.
 */
export const calculateTeamCompatibility = (user: User, teamMembers: User[]): number => {
  if (!user || !teamMembers || teamMembers.length === 0) return 0;
  
  let totalScore = 0;
  let count = 0;

  for (const member of teamMembers) {
    if (member && member._id !== user._id) {
      totalScore += calculateCompatibility(user, member);
      count++;
    }
  }

  return count > 0 ? Math.round(totalScore / count) : 0;
};
