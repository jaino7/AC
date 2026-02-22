import { Module } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { PayoutService } from './payout.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RevenueService, PayoutService],
  exports: [RevenueService, PayoutService],
})
export class RevenueModule {}
