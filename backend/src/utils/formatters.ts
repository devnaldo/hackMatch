export function parseJsonArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function formatUser(user: any) {
  if (!user) return null;
  return {
    _id: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    branch: user.branch || '',
    bio: user.bio || '',
    profilePicture: user.profilePicture,
    skills: parseJsonArray(user.skills),
    experience: user.experience,
    githubUrl: user.githubUrl || '',
    linkedinUrl: user.linkedinUrl || '',
    portfolioUrl: user.portfolioUrl || '',
    isAvailable: user.isAvailable,
    role: user.role,
    isBanned: user.isBanned,
    teamsJoined: user.teamMemberships ? user.teamMemberships.map((tm: any) => tm.teamId) : [],
    hackathonsInterested: user.hackathonRegistrations ? user.hackathonRegistrations.map((hr: any) => hr.hackathonId) : [],
    badges: user.badges ? user.badges.map((b: any) => ({ skill: b.skill, level: b.level, earnedAt: b.earnedAt.toISOString() })) : [],
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

export function formatTeam(team: any) {
  if (!team) return null;
  return {
    _id: team.id,
    id: team.id,
    teamName: team.teamName,
    description: team.description,
    leaderId: team.leader ? formatUser(team.leader) : team.leaderId,
    members: team.members ? team.members.map((m: any) => formatUser(m.user)) : [],
    requiredSkills: parseJsonArray(team.requiredSkills),
    maxSize: team.maxSize,
    hackathonId: team.hackathon ? formatHackathon(team.hackathon) : team.hackathonId,
    status: team.status,
    projectIdea: team.projectIdea || '',
    tags: parseJsonArray(team.tags),
    createdAt: team.createdAt?.toISOString(),
    updatedAt: team.updatedAt?.toISOString(),
  };
}

export function formatHackathon(hackathon: any) {
  if (!hackathon) return null;
  return {
    _id: hackathon.id,
    id: hackathon.id,
    title: hackathon.title,
    organizer: hackathon.organizer,
    description: hackathon.description,
    date: hackathon.date,
    registrationDeadline: hackathon.registrationDeadline,
    location: hackathon.location,
    mode: hackathon.mode,
    prizePool: hackathon.prizePool,
    teamSize: {
      min: hackathon.minTeamSize,
      max: hackathon.maxTeamSize,
    },
    tags: parseJsonArray(hackathon.tags),
    registrationLink: hackathon.registrationLink || '',
    rules: hackathon.rules || '',
    isActive: hackathon.isActive,
    createdAt: hackathon.createdAt?.toISOString(),
    updatedAt: hackathon.updatedAt?.toISOString(),
  };
}

export function formatTeamRequest(req: any) {
  if (!req) return null;
  return {
    _id: req.id,
    id: req.id,
    type: req.type,
    senderId: req.sender ? formatUser(req.sender) : req.senderId,
    receiverId: req.receiver ? formatUser(req.receiver) : req.receiverId,
    teamId: req.team ? formatTeam(req.team) : req.teamId,
    status: req.status,
    message: req.message || '',
    createdAt: req.createdAt?.toISOString(),
    updatedAt: req.updatedAt?.toISOString(),
  };
}

export function formatMessage(msg: any) {
  if (!msg) return null;
  return {
    _id: msg.id,
    id: msg.id,
    teamId: msg.teamId,
    senderId: msg.sender ? {
      _id: msg.sender.id,
      name: msg.sender.name,
      profilePicture: msg.sender.profilePicture,
    } : { _id: msg.senderId, name: 'User', profilePicture: '' },
    content: msg.content,
    type: msg.type,
    createdAt: msg.createdAt?.toISOString(),
  };
}

export function formatNotification(n: any) {
  if (!n) return null;
  return {
    _id: n.id,
    id: n.id,
    userId: n.userId,
    text: n.text,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt?.toISOString(),
  };
}

export function formatProjectIdea(idea: any) {
  if (!idea) return null;
  return {
    _id: idea.id,
    id: idea.id,
    title: idea.title,
    domain: idea.domain,
    description: idea.description,
    submittedBy: idea.submittedBy ? formatUser(idea.submittedBy) : idea.submittedById,
    upvotes: parseJsonArray(idea.upvotes),
    tags: parseJsonArray(idea.tags),
    createdAt: idea.createdAt?.toISOString(),
  };
}
