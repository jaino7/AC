import { Module, forwardRef } from '@nestjs/common';
import { BankTransfersController } from './bank-transfers.controller';
import { VirtualAccountController } from './virtual-account.controller';
import { AdminController } from './admin.controller';
import { BankTransfersService } from './bank-transfers.service';
import { GmoApiService } from './gmo-api.service';
import { VirtualAccountService } from './virtual-account.service';
import { CronService } from './cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ConfigModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [
    BankTransfersController,
    VirtualAccountController,
    AdminController,
  ],
  providers: [
    BankTransfersService,
    GmoApiService,
    VirtualAccountService,
    CronService,
  ],
  exports: [
    BankTransfersService,
    GmoApiService,
    VirtualAccountService,
  ],
})
export class BankTransfersModule {}
