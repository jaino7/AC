export const SHARED_GREETING = "Hello from shared package!";

export * from "@prisma/client";

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
