export const SHARED_GREETING = "Hello from shared package!";

export * from "@prisma/client";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  prismaConnections: number;
};

// 開発環境での接続追跡
if (process.env.NODE_ENV !== "production") {
  if (!globalForPrisma.prismaConnections) {
    globalForPrisma.prismaConnections = 0;
  }
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;

  // プロセス終了時に接続をクローズ
  if (!global.prismaShutdownHook) {
    global.prismaShutdownHook = true;
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
  }
}
