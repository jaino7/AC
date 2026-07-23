export const SHARED_GREETING = "Hello from shared package!";

export * from "@prisma/client";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  prismaShutdownHook: boolean;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// プロセス終了時に接続をクローズ（本番・開発共通）
if (!globalForPrisma.prismaShutdownHook) {
  globalForPrisma.prismaShutdownHook = true;
  const disconnect = async () => { await prisma.$disconnect(); };
  process.on("beforeExit", disconnect);
  process.on("SIGINT", disconnect);
  process.on("SIGTERM", disconnect);
}
