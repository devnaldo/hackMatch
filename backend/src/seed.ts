import { prisma } from './config/db';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('Database already contains seed data. Skipping auto-seed.');
      return;
    }

    console.log('Seeding initial HackMatch data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const adminUser = await prisma.user.create({
      data: {
        name: 'Alex Admin',
        email: 'admin@hackmatch.com',
        password: hashedPassword,
        college: 'Stanford University',
        branch: 'Computer Science',
        bio: 'Hackathon enthusiast and platform administrator.',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']),
        experience: 'advanced',
        role: 'admin',
      },
    });

    const user1 = await prisma.user.create({
      data: {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password: hashedPassword,
        college: 'MIT',
        branch: 'Electrical Engineering & CS',
        bio: 'Full-stack developer focused on AI applications and responsive UI design.',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        skills: JSON.stringify(['React', 'Python', 'TailwindCSS', 'PyTorch', 'Node.js']),
        experience: 'advanced',
        githubUrl: 'https://github.com/sarahchen',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Michael Rodriguez',
        email: 'michael@example.com',
        password: hashedPassword,
        college: 'UC Berkeley',
        branch: 'Software Engineering',
        bio: 'Backend systems engineer, microservices lover, and PostgreSQL fan.',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        skills: JSON.stringify(['Java', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Go']),
        experience: 'intermediate',
        githubUrl: 'https://github.com/mrodriguez',
      },
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        college: 'IIT Bombay',
        branch: 'Computer Science',
        bio: 'ML researcher & Mobile developer building next-gen AI tools.',
        profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        skills: JSON.stringify(['Python', 'TensorFlow', 'Flutter', 'React', 'FastAPI']),
        experience: 'intermediate',
        githubUrl: 'https://github.com/priyasharma',
      },
    });

    // Add Badges
    await prisma.badge.createMany({
      data: [
        { userId: user1.id, skill: 'React Champion', level: 'Gold' },
        { userId: user1.id, skill: 'AI Innovator', level: 'Silver' },
        { userId: user2.id, skill: 'Database Guru', level: 'Gold' },
        { userId: user3.id, skill: 'ML Architect', level: 'Platinum' },
      ],
    });

    // 2. Create Hackathons
    const hack1 = await prisma.hackathon.create({
      data: {
        title: 'Global AI & Web3 Hackathon 2026',
        organizer: 'TechCorp & OpenSource Foundation',
        description: '48-hour global hackathon building state-of-the-art AI agents, decentralized applications, and high-performance Web3 tools.',
        date: 'Oct 15 - Oct 17, 2026',
        registrationDeadline: 'Oct 10, 2026',
        location: 'Virtual / Online',
        mode: 'online',
        prizePool: '$50,000',
        minTeamSize: 2,
        maxTeamSize: 4,
        tags: JSON.stringify(['AI', 'Web3', 'React', 'Node.js', 'Python']),
        registrationLink: 'https://hackathon.example.com/global-ai',
        rules: 'Open to all developers worldwide. Submissions must include GitHub repository and video demo.',
      },
    });

    const hack2 = await prisma.hackathon.create({
      data: {
        title: 'HealthTech & Sustainability Summit',
        organizer: 'BioInnovate Lab',
        description: 'Create impactful tech solutions addressing mental healthcare, green energy, and sustainable city infrastructure.',
        date: 'Nov 05 - Nov 07, 2026',
        registrationDeadline: 'Nov 01, 2026',
        location: 'San Francisco, CA & Hybrid',
        mode: 'hybrid',
        prizePool: '$25,000',
        minTeamSize: 1,
        maxTeamSize: 4,
        tags: JSON.stringify(['Healthcare', 'Sustainability', 'IoT', 'Mobile']),
      },
    });

    // 3. Create Teams
    const team1 = await prisma.team.create({
      data: {
        teamName: 'Neural Sync',
        description: 'Building an autonomous AI team matching agent powered by LLMs and vector embeddings.',
        leaderId: user1.id,
        requiredSkills: JSON.stringify(['Node.js', 'PostgreSQL', 'Redis', 'Python']),
        maxSize: 4,
        hackathonId: hack1.id,
        status: 'open',
        projectIdea: 'Autonomous Hackathon Teammate Matching Platform',
        tags: JSON.stringify(['AI', 'Fullstack', 'Web3']),
        members: {
          create: [
            { userId: user1.id },
            { userId: user2.id },
          ],
        },
      },
    });

    // 4. Create Project Ideas
    await prisma.projectIdea.createMany({
      data: [
        {
          title: 'Smart Medical Triage Assistant',
          domain: 'Healthcare',
          description: 'AI-powered voice & text triage system that analyzes symptoms and directs patients to emergency care.',
          submittedById: user3.id,
          upvotes: JSON.stringify([user1.id, user2.id, user3.id]),
          tags: JSON.stringify(['AI', 'Healthcare', 'FastAPI']),
        },
        {
          title: 'Decentralized Micro-Grant Distribution',
          domain: 'Blockchain',
          description: 'Smart contracts for automated peer-reviewed grant disbursement for open-source contributors.',
          submittedById: user2.id,
          upvotes: JSON.stringify([user1.id, user2.id]),
          tags: JSON.stringify(['Web3', 'Solidity', 'Ethereum']),
        },
      ],
    });

    // 5. Create Team Messages
    await prisma.message.createMany({
      data: [
        {
          teamId: team1.id,
          senderId: user1.id,
          content: 'Welcome to Neural Sync team chat! Excited to build our project for Global AI Hackathon.',
          type: 'text',
        },
        {
          teamId: team1.id,
          senderId: user2.id,
          content: 'Glad to join! I have set up the PostgreSQL and Redis Docker containers.',
          type: 'text',
        },
      ],
    });

    // 6. Create Notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: user1.id,
          text: 'Michael Rodriguez joined your team Neural Sync.',
          type: 'acceptance',
          isRead: false,
        },
        {
          userId: user2.id,
          text: 'Global AI & Web3 Hackathon 2026 starts in 3 weeks!',
          type: 'deadline',
          isRead: true,
        },
      ],
    });

    console.log('Seed data inserted successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
