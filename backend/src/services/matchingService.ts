export interface UserProfile {
  id: string;
  name: string;
  skills: string[];
  experience: string;
  college: string;
  isAvailable: boolean;
}

export interface TeamProfile {
  id: string;
  teamName: string;
  requiredSkills: string[];
  maxSize: number;
  currentSize: number;
  status: string;
}

export class RecommendationEngine {
  /**
   * Calculate compatibility match score (0 - 100%) between a User and a Team
   */
  static calculateTeamUserMatchScore(userSkills: string[], userExp: string, requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 75; // Default good match score

    const normalizedUserSkills = userSkills.map((s) => s.trim().toLowerCase());
    const normalizedReqSkills = requiredSkills.map((s) => s.trim().toLowerCase());

    const matchingSkills = normalizedReqSkills.filter((skill) =>
      normalizedUserSkills.includes(skill)
    );

    const skillScore = (matchingSkills.length / normalizedReqSkills.length) * 70; // 70% weight on skill match

    let expScore = 15; // default base weight
    if (userExp === 'advanced') expScore = 30;
    else if (userExp === 'intermediate') expScore = 20;

    const totalScore = Math.min(Math.round(skillScore + expScore), 99);
    return Math.max(totalScore, 40); // Floor at 40%
  }

  /**
   * Calculate compatibility match score (0 - 100%) between two Users (Teammate Search)
   */
  static calculateTeammateMatchScore(u1Skills: string[], u2Skills: string[], u1College: string, u2College: string): number {
    const norm1 = u1Skills.map((s) => s.trim().toLowerCase());
    const norm2 = u2Skills.map((s) => s.trim().toLowerCase());

    // Complementary skills get extra points, overlapping skills get baseline points
    const sharedSkills = norm1.filter((s) => norm2.includes(s));
    const totalUnique = new Set([...norm1, ...norm2]).size;

    let skillScore = 50;
    if (totalUnique > 0) {
      skillScore = Math.round((sharedSkills.length / Math.min(norm1.length || 1, norm2.length || 1)) * 50);
    }

    let collegeBonus = 0;
    if (u1College && u2College && u1College.toLowerCase() === u2College.toLowerCase()) {
      collegeBonus = 20;
    }

    const total = Math.min(50 + skillScore / 2 + collegeBonus, 98);
    return Math.max(Math.round(total), 45);
  }
}
