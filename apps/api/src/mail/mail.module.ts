import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from './mail.service';
import { DevMailProvider } from './providers/dev-mail.provider';
import { ResendMailProvider } from './providers/resend-mail.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    DevMailProvider,
    ResendMailProvider,
    {
      provide: 'MAIL_PROVIDER',
      useFactory: (
        devMailProvider: DevMailProvider,
        resendMailProvider: ResendMailProvider,
        configService: ConfigService,
      ) => {
        const mailProvider = configService.get<string>('MAIL_PROVIDER', 'DEV');

        switch (mailProvider) {
          case 'RESEND':
            return resendMailProvider;
          case 'DEV':
          default:
            return devMailProvider;
        }
      },
      inject: [DevMailProvider, ResendMailProvider, ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
