import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BankTransfersModule } from '../bank-transfers/bank-transfers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BankTransfersModule), NotificationsModule, MailModule],
  controllers: [PaymentsController, ClaimsController],
  providers: [PaymentsService, ClaimsService],
  exports: [PaymentsService, ClaimsService],
})
export class PaymentsModule {}
