import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: DiscordEmbedField[];
  footer?: {
    text: string;
  };
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send a message to Discord webhook
   */
  async sendWebhook(
    webhookUrl: string,
    payload: DiscordWebhookPayload,
  ): Promise<void> {
    if (!webhookUrl) {
      this.logger.warn('Discord webhook URL is not configured');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Discord webhook failed: ${response.status} ${errorText}`,
        );
      }

      this.logger.log('Discord notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send Discord notification', error);
      throw error;
    }
  }

  /**
   * Send ban inquiry notification
   */
  async sendBanInquiry(data: {
    userId: string;
    name: string;
    email: string;
    tier: number;
    trustScore: number;
    transferDetails: string;
    message: string;
    adminLink: string;
  }): Promise<void> {
    const webhookUrl = this.configService.get<string>(
      'DISCORD_WEBHOOK_BAN_INQUIRY',
    );

    if (!webhookUrl) {
      this.logger.warn('Ban inquiry webhook URL is not configured');
      return;
    }

    const tierLabels = ['新規', '信頼済み', '優良'];
    const tierLabel = tierLabels[data.tier] || '不明';

    // Determine color based on tier (red for tier 0, yellow for tier 1, green for tier 2)
    const tierColors = [0xff5555, 0xffaa00, 0x55ff55];
    const color = tierColors[data.tier] || 0xff5555;

    const embed: DiscordEmbed = {
      title: '🔒 アカウント停止 - 問い合わせ受付',
      description: `ユーザーからアカウント停止に関する問い合わせがありました。`,
      color: color,
      fields: [
        {
          name: '👤 ユーザー情報',
          value: `**名前:** ${data.name}\n**メール:** ${data.email}\n**ID:** \`${data.userId}\``,
          inline: false,
        },
        {
          name: '📊 信用情報',
          value: `**ティア:** ${data.tier} (${tierLabel})\n**信用スコア:** ${data.trustScore}`,
          inline: true,
        },
        {
          name: '💳 振込詳細',
          value: data.transferDetails || '記載なし',
          inline: true,
        },
        {
          name: '📝 問い合わせ内容',
          value: data.message.length > 1000
            ? data.message.substring(0, 1000) + '...'
            : data.message,
          inline: false,
        },
        {
          name: '🔗 管理者用リンク',
          value: `[ユーザー詳細ページを開く](${data.adminLink})`,
          inline: false,
        },
      ],
      footer: {
        text: 'CocoBa Trust & Lock System',
      },
      timestamp: new Date().toISOString(),
    };

    const payload: DiscordWebhookPayload = {
      content: '@here 新しいアカウント停止の問い合わせが届きました',
      embeds: [embed],
    };

    await this.sendWebhook(webhookUrl, payload);
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(data: {
    userId: string;
    userName: string;
    amount: number;
    identifierCode: string;
    tier: number;
    trustScore: number;
    adminLink: string;
  }): Promise<void> {
    const webhookUrl = this.configService.get<string>(
      'DISCORD_WEBHOOK_PAYMENT',
    );

    if (!webhookUrl) {
      this.logger.warn('Payment webhook URL is not configured');
      return;
    }

    const tierLabels = ['新規', '信頼済み', '優良'];
    const tierLabel = tierLabels[data.tier] || '不明';

    const embed: DiscordEmbed = {
      title: '💰 入金通知',
      description: `ユーザーからの入金が確認されました。`,
      color: 0x00ff00, // Green
      fields: [
        {
          name: '👤 ユーザー',
          value: `**名前:** ${data.userName}\n**ID:** \`${data.userId}\``,
          inline: true,
        },
        {
          name: '💵 金額',
          value: `¥${data.amount.toLocaleString()}`,
          inline: true,
        },
        {
          name: '🔢 識別コード',
          value: `\`${data.identifierCode}\``,
          inline: false,
        },
        {
          name: '📊 信用情報',
          value: `**ティア:** ${data.tier} (${tierLabel})\n**スコア:** ${data.trustScore}`,
          inline: false,
        },
        {
          name: '🔗 管理者用リンク',
          value: `[ユーザー詳細ページを開く](${data.adminLink})`,
          inline: false,
        },
      ],
      footer: {
        text: 'CocoBa Payment System',
      },
      timestamp: new Date().toISOString(),
    };

    const payload: DiscordWebhookPayload = {
      embeds: [embed],
    };

    await this.sendWebhook(webhookUrl, payload);
  }

  /**
   * Send claim notification (when user clicks "振り込みました" or "申告する")
   */
  async sendClaimNotification(data: {
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    tier: number;
    trustScore: number;
    immediateCredit: number;
    pendingCredit: number;
    creatorHandle?: string;
    virtualAccount?: {
      accountNumber: string;
      branchCode: string | null;
      branchName: string | null;
    };
  }): Promise<void> {
    const webhookUrl = this.configService.get<string>(
      'DISCORD_WEBHOOK_PAYMENT',
    );

    if (!webhookUrl) {
      this.logger.warn('Payment webhook URL is not configured');
      return;
    }

    const tierLabels = ['新規', '信頼済み', '優良'];
    const tierLabel = tierLabels[data.tier] || '不明';

    // Determine color based on tier
    const tierColors = [0xff5555, 0xffaa00, 0x55ff55];
    const color = tierColors[data.tier] || 0xff5555;

    // Build status message
    let statusMessage = '';
    if (data.tier === 0) {
      // Tier 0: No immediate credit
      statusMessage = `全額保留中 (¥${data.amount.toLocaleString()})\n振込確認後に付与されます`;
    } else if (data.tier === 1) {
      // Tier 1: Up to 3,000 yen immediate
      if (data.immediateCredit > 0) {
        statusMessage = `✅ 即時反映済: ¥${data.immediateCredit.toLocaleString()}`;
        if (data.pendingCredit > 0) {
          statusMessage += `\n⏳ 保留中: ¥${data.pendingCredit.toLocaleString()}`;
        }
      } else {
        statusMessage = `全額保留中 (¥${data.amount.toLocaleString()})`;
      }
    } else {
      // Tier 2+: Up to 20,000 yen immediate
      if (data.immediateCredit > 0) {
        statusMessage = `✅ 即時反映済: ¥${data.immediateCredit.toLocaleString()}`;
        if (data.pendingCredit > 0) {
          statusMessage += `\n⏳ 保留中: ¥${data.pendingCredit.toLocaleString()}`;
        }
      } else {
        statusMessage = `全額反映済 (¥${data.amount.toLocaleString()})`;
      }
    }

    const fields: DiscordEmbedField[] = [
      {
        name: '👤 ユーザー情報',
        value: `**名前:** ${data.userName}\n**メール:** ${data.userEmail}\n**ID:** \`${data.userId}\``,
        inline: false,
      },
      {
        name: '📊 信用情報',
        value: `**ティア:** ${data.tier} (${tierLabel})\n**スコア:** ${data.trustScore}`,
        inline: true,
      },
    ];

    // Only show amount for tier 1 and above
    if (data.tier > 0) {
      fields.push({
        name: '💵 申告金額',
        value: `¥${data.amount.toLocaleString()}`,
        inline: true,
      });
    }

    fields.push({
      name: '💳 クレジット状態',
      value: statusMessage,
      inline: false,
    });

    // Add virtual account info if available
    if (data.virtualAccount) {
      fields.push({
        name: '🏦 割当口座',
        value: `**口座番号:** \`${data.virtualAccount.accountNumber}\`\n**支店:** ${data.virtualAccount.branchName || '不明'} (${data.virtualAccount.branchCode || '-'})`,
        inline: false,
      });
    }

    if (data.creatorHandle) {
      fields.push({
        name: '🎨 クリエイター',
        value: `@${data.creatorHandle}`,
        inline: false,
      });
    }

    const embed: DiscordEmbed = {
      title: data.tier === 0 ? '📢 振込申告 (ティア0)' : '📢 チャージ申告',
      description: data.tier === 0
        ? 'ティア0ユーザーが「振り込みました」ボタンを押しました。'
        : 'ユーザーが「申告する」ボタンを押しました。',
      color: color,
      fields: fields,
      footer: {
        text: 'CocoBa Trust & Lock System',
      },
      timestamp: new Date().toISOString(),
    };

    const payload: DiscordWebhookPayload = {
      embeds: [embed],
    };

    await this.sendWebhook(webhookUrl, payload);
  }
}
