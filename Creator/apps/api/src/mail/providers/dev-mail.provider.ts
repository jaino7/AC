import { Injectable } from '@nestjs/common';
import { EmailType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MailProvider,
  SendEmailParams,
  SendEmailResult,
} from '../interfaces/mail-provider.interface';

@Injectable()
export class DevMailProvider implements MailProvider {
  constructor(private prisma: PrismaService) {}

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, emailType, recipientId, metadata } = params;

    try {
      // Create EmailLog record with status: SENT
      const emailLog = await this.prisma.emailLog.create({
        data: {
          toEmail: to,
          subject,
          emailType: emailType as EmailType,
          recipientId,
          status: 'SENT',
          sentAt: new Date(),
          metadata: metadata || {},
        },
      });

      // Output to console in a beautiful format
      console.log('\n========================================');
      console.log('📧 [DEV] Email Sent (not actually sent)');
      console.log('========================================');
      console.log(`To:       ${to}`);
      console.log(`Subject:  ${subject}`);
      console.log(`Type:     ${emailType}`);
      console.log(`Log ID:   ${emailLog.id}`);

      if (metadata && Object.keys(metadata).length > 0) {
        console.log('\n📝 Metadata:');
        console.log(JSON.stringify(metadata, null, 2));
      }

      // Show HTML preview (first 200 characters)
      console.log('\n📄 HTML Preview:');
      const htmlPreview =
        html.length > 200 ? html.substring(0, 200) + '...' : html;
      console.log(htmlPreview);
      console.log('========================================\n');

      return {
        success: true,
        emailLogId: emailLog.id,
        messageId: `dev-${emailLog.id}`,
      };
    } catch (error) {
      console.error('❌ [DEV] Email Error:', error);
      return {
        success: false,
        error: (error as any).message,
      };
    }
  }
}
