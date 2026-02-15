export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  emailType: string;
  recipientId: string;
  metadata?: Record<string, any>;
}

export interface SendEmailResult {
  success: boolean;
  emailLogId?: string;
  messageId?: string;
  error?: string;
}

export interface MailProvider {
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
}
