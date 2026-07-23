import { Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CreatorsModule } from "./creators/creators.module";
import { TransactionsModule } from './transactions/transactions.module';
import { BankTransfersModule } from './bank-transfers/bank-transfers.module';
import { PaymentsModule } from './payments/payments.module';
import { MailModule } from './mail/mail.module';
import { DomainsModule } from './domains/domains.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RevenueModule } from './revenue/revenue.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    // レート制限（グローバル設定）
    // 1分間に100リクエストまで
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60秒
      limit: 100, // 100リクエスト
    }]),
    CreatorsModule,
    TransactionsModule,
    BankTransfersModule,
    PaymentsModule,
    MailModule,
    DomainsModule,
    WebhooksModule,
    AdminModule,
    NotificationsModule,
    RevenueModule,
    StorageModule,
  ],
  providers: [
    // グローバルにレート制限ガードを適用
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
