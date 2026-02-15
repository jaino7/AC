import { Inject, Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import { MailProvider } from './interfaces/mail-provider.interface';
import WelcomeEmail from './templates/welcome.template';
import DepositSuccessEmail from './templates/deposit-success.template';
import PurchaseSuccessEmail from './templates/purchase-success.template';
import AnnouncementEmail from './templates/announcement.template';
import PasswordResetEmail from './templates/password-reset.template';
import PaymentInstructionEmail from './templates/payment-instruction.template';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_PROVIDER')
    private readonly mailProvider: MailProvider,
  ) {}

  async sendWelcomeEmail(
    to: string,
    data: {
      userType: 'creator' | 'fan';
      name: string;
      email: string;
      handle?: string;
      creatorName?: string;
    },
    recipientId: string,
  ) {
    const emailType =
      data.userType === 'creator'
        ? 'CREATOR_REGISTRATION'
        : 'FAN_EMAIL_VERIFICATION';
    const subject =
      data.userType === 'creator'
        ? 'CocoBaへようこそ！クリエイター登録が完了しました'
        : `${data.creatorName}のファンコミュニティへようこそ！`;

    const html = await render(WelcomeEmail(data));

    return this.mailProvider.sendEmail({
      to,
      subject,
      html,
      emailType,
      recipientId,
      metadata: data,
    });
  }

  async sendDepositSuccessEmail(
    to: string,
    data: {
      fanName: string;
      amount: number;
      balance: number;
      transferorName: string;
      transferDate: Date;
    },
    recipientId: string,
  ) {
    const subject = '入金が完了しました';
    const html = await render(DepositSuccessEmail(data));

    return this.mailProvider.sendEmail({
      to,
      subject,
      html,
      emailType: 'FAN_RECEIPT',
      recipientId,
      metadata: data,
    });
  }

  async sendPurchaseSuccessEmail(
    to: string,
    data: {
      fanName: string;
      contentTitle: string;
      amount: number;
      balance: number;
      contentUrl: string;
    },
    recipientId: string,
  ) {
    const subject = 'コンテンツ購入が完了しました';
    const html = await render(PurchaseSuccessEmail(data));

    return this.mailProvider.sendEmail({
      to,
      subject,
      html,
      emailType: 'FAN_RECEIPT',
      recipientId,
      metadata: data,
    });
  }

  async sendAnnouncementEmail(
    to: string,
    data: {
      recipientName: string;
      title: string;
      content: string;
    },
    recipientId: string,
  ) {
    const html = await render(AnnouncementEmail(data));

    return this.mailProvider.sendEmail({
      to,
      subject: data.title,
      html,
      emailType: 'CREATOR_ANNOUNCEMENT',
      recipientId,
      metadata: data,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    data: {
      userType: 'creator' | 'fan';
      name: string;
      resetUrl: string;
    },
    recipientId: string,
  ) {
    const emailType =
      data.userType === 'creator'
        ? 'CREATOR_PASSWORD_RESET'
        : 'FAN_PASSWORD_RESET';
    const subject = 'パスワード再設定のご案内';
    const html = await render(PasswordResetEmail(data));

    return this.mailProvider.sendEmail({
      to,
      subject,
      html,
      emailType,
      recipientId,
      metadata: data,
    });
  }

  async sendVirtualAccountReclaimWarningEmail(
    to: string,
    data: {
      creatorName: string;
      accountNumber: string;
      reclaimDate: Date;
    },
    recipientId: string,
  ) {
    const subject = '【重要】振込口座の回収予定のお知らせ';
    const html = await render(AnnouncementEmail({
      recipientName: data.creatorName,
      title: '【重要】振込口座の回収予定のお知らせ',
      content: `${data.creatorName} 様\n\n平素よりCocoBaをご利用いただきありがとうございます。\n\n現在ご登録の振込口座（末尾: ${data.accountNumber.slice(-4)}）が、${data.reclaimDate.toLocaleDateString('ja-JP')} に回収される予定です。\n\nこれは、無料プランでのご利用が6ヶ月以上続いているため、口座リソースを他のユーザーへ提供するための処置です。\n\n引き続きご利用いただく場合は、有料プランへのアップグレードをご検討ください。口座回収後は、新たなプラン購入時に新しい口座が割り当てられます。\n\nご不明な点はサポートまでお問い合わせください。`,
    }));

    return this.mailProvider.sendEmail({
      to,
      subject,
      html,
      emailType: 'CREATOR_ANNOUNCEMENT',
      recipientId,
      metadata: data,
    });
  }

  async sendVirtualAccountReclaimedEmail(
    to: string,
    data: {
      creatorName: string;
      accountNumber: string;
    },
    recipientId: string,
  ) {
    const subject = '【通知】振込口座の回収が完了しました';
    const html = await render(AnnouncementEmail({
      recipientName: data.creatorName,
      title: '【通知】振込口座の回収が完了しました',
      content: `${data.creatorName} 様\n\n振込口座（末尾: ${data.accountNumber.slice(-4)}）の回収が完了しました。\n\nこの口座への振り込みは今後処理されませんのでご注意ください。\n\n再度ご利用いただく場合は、有料プランへのアップグレード後に新しい口座が自動的に割り当てられます。\n\nご不明な点はサポートまでお問い合わせください。`,
    }));

    return this.mailProvider.sendEmail({
      to,
      subject,
      html,
      emailType: 'CREATOR_ANNOUNCEMENT',
      recipientId,
      metadata: data,
    });
  }

  async sendPaymentInstructionEmail(
    to: string,
    data: {
      fanName: string;
      creatorName: string;
      creatorHandle: string;
      planName?: string;
      amount: number;
      bankName: string;
      branchName: string;
      accountType: string;
      accountNumber: string;
      accountHolder: string;
      identifierCode: string;
      dueDate: Date;
    },
    recipientId: string,
  ) {
    const subject = 'お振込のご案内';
    const html = await render(PaymentInstructionEmail(data));

    return this.mailProvider.sendEmail({
      to,
      subject,
      html,
      emailType: 'FAN_PAYMENT_INSTRUCTIONS',
      recipientId,
      metadata: data,
    });
  }
}
