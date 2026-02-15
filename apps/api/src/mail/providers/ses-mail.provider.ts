import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MailProvider,
  SendEmailParams,
  SendEmailResult,
} from '../interfaces/mail-provider.interface';

@Injectable()
export class SesMailProvider implements MailProvider {
  private readonly logger = new Logger(SesMailProvider.name);
  private sesClient: SESClient;
  private fromEmail: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize SES client
    const region = this.configService.get<string>('AWS_REGION', 'ap-northeast-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.fromEmail = this.configService.get<string>('AWS_SES_FROM_EMAIL', 'noreply@example.com');

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('AWS credentials not configured. SES emails will fail.');
    }

    this.sesClient = new SESClient({
      region,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });

    this.logger.log(`SES Mail Provider initialized with region: ${region}, from: ${this.fromEmail}`);
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, emailType, recipientId, metadata } = params;

    // Create EmailLog record with status: PENDING
    const emailLog = await this.prisma.emailLog.create({
      data: {
        toEmail: to,
        subject,
        emailType: emailType as any,
        recipientId,
        status: 'PENDING',
        metadata: metadata || {},
      },
    });

    try {
      // Send email via SES
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const result = await this.sesClient.send(command);

      // Update EmailLog to SENT
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Email sent successfully to ${to} (MessageId: ${result.MessageId})`);

      return {
        success: true,
        emailLogId: emailLog.id,
        messageId: result.MessageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as any).message}`, (error as any).stack);

      // Update EmailLog to FAILED
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          errorMessage: (error as any).message,
        },
      });

      return {
        success: false,
        emailLogId: emailLog.id,
        error: (error as any).message,
      };
    }
  }
}
