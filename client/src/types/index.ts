export interface Badge {
  skill: string;
  level: string;
  earnedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  college: string;
  branch?: string;
  bio?: string;
  profilePicture: string;
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  isAvailable: boolean;
  teamsJoined: string[] | Team[];
  hackathonsInterested: string[] | Hackathon[];
  badges: Badge[];
  role: 'user' | 'admin';
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  teamName: string;
  description: string;
  leaderId: string | User;
  members: string[] | User[];
  requiredSkills: string[];
  maxSize: number;
  hackathonId?: string | Hackathon;
  status: 'open' | 'full' | 'closed';
  projectIdea?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Hackathon {
  _id: string;
  title: string;
  organizer: string;
  description: string;
  date: string;
  registrationDeadline: string;
  location: string;
  mode: 'online' | 'offline' | 'hybrid';
  prizePool: string;
  teamSize: { min: number; max: number };
  tags: string[];
  registrationLink?: string;
  rules?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamRequest {
  _id: string;
  type: 'join_request' | 'invitation';
  senderId: User;
  receiverId: User;
  teamId: Team;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  teamId: string;
  senderId: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  content: string;
  type: 'text' | 'link' | 'system';
  createdAt: string;
}

export interface ProjectIdea {
  _id: string;
  title: string;
  domain: 'AI' | 'Web' | 'Blockchain' | 'Healthcare' | 'Education' | 'Finance' | 'Other';
  description: string;
  submittedBy: User;
  upvotes: string[];
  tags: string[];
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  text: string;
  type: 'join_request' | 'invitation' | 'acceptance' | 'rejection' | 'deadline' | 'left_team' | 'custom';
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}
