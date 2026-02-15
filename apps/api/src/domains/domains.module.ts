import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { CloudflareService } from './cloudflare.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [DomainsController],
  providers: [DomainsService, CloudflareService],
  exports: [DomainsService],
})
export class DomainsModule {}
