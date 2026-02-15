import { Module } from '@nestjs/common';
import { ClaimsAdminController } from './claims-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [ClaimsAdminController],
})
export class AdminModule {}
