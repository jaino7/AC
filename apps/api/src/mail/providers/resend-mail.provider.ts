import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MailProvider,
  SendEmailParams,
  SendEmailResult,
} from '../interfaces/mail-provider.interface';

@Injectable()
export class ResendMailProvider implements MailProvider {
  private readonly logger = new Logger(ResendMailProvider.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'MAIL_FROM_EMAIL',
      'noreply@example.com',
    );

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not configured. Resend emails will fail.');
    }

    this.resend = new Resend(apiKey);
    this.logger.log(`Resend Mail Provider initialized. From: ${this.fromEmail}`);
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, emailType, recipientId, metadata } = params;

    let emailLogId: string | undefined;

    try {
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
      emailLogId = emailLog.id;

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Email sent successfully to ${to} (MessageId: ${data?.id})`);

      return {
        success: true,
        emailLogId: emailLog.id,
        messageId: data?.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${(error as any).message}`,
        (error as any).stack,
      );

      if (emailLogId) {
        await this.prisma.emailLog.update({
          where: { id: emailLogId },
          data: {
            status: 'FAILED',
            errorMessage: (error as any).message,
          },
        }).catch(() => {/* ignore update failure */});
      }

      return {
        success: false,
        emailLogId,
        error: (error as any).message,
      };
    }
  }
}
