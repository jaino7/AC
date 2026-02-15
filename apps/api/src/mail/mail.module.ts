import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from './mail.service';
import { DevMailProvider } from './providers/dev-mail.provider';
import { SesMailProvider } from './providers/ses-mail.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    DevMailProvider,
    SesMailProvider,
    {
      provide: 'MAIL_PROVIDER',
      useFactory: (
        devMailProvider: DevMailProvider,
        sesMailProvider: SesMailProvider,
        configService: ConfigService,
      ) => {
        const mailProvider = configService.get<string>('MAIL_PROVIDER', 'DEV');

        switch (mailProvider) {
          case 'SES':
            return sesMailProvider;
          case 'DEV':
          default:
            return devMailProvider;
        }
      },
      inject: [DevMailProvider, SesMailProvider, ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
