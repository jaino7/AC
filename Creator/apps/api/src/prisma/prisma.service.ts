import { INestApplication, Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  // enableShutdownHooks is no longer needed in NestJS 10+ with Prisma 5+
  // as it is handled automatically or via specific hooks if needed.
  // Keeping empty or removing if not used elsewhere.

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
