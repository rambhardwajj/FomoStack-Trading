import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function connectPrisma() {
  try {
    await prisma.$connect();
  } catch (error) {
    process.exit(1);
  }
}

connectPrisma();