import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('PostgreSQL database connected successfully via Prisma');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
  }
}
