import { PrismaClient } from '@prisma/client';

// Add any Prisma extensions or global configurations here
const prisma = new PrismaClient();

export * from '@prisma/client';
export { prisma };
