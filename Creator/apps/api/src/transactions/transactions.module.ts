import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { BankTransferPollService } from './bank-transfer-poll.service';
import { PaymentMatchingService } from './payment-matching.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [TransactionsController],
    providers: [
        TransactionsService,
        BankTransferPollService,
        PaymentMatchingService,
        PrismaService,
    ],
})
export class TransactionsModule { }
