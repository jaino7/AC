const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_IDENTITY_WEBHOOK_URL = process.env.DISCORD_IDENTITY_WEBHOOK_URL;

export async function sendCreatorRegistrationNotification(
  email: string,
  handle: string,
): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('DISCORD_WEBHOOK_URL is not set, skipping Discord notification');
    return;
  }

  const siteUrl = process.env.WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const profileUrl = `${siteUrl}/${handle}`;

  const payload = {
    embeds: [
      {
        title: '🎉 新しいクリエイターが登録しました！',
        color: 0x5865f2,
        fields: [
          { name: 'メールアドレス', value: email, inline: true },
          { name: 'ハンドル', value: handle, inline: true },
          { name: 'プロフィール', value: profileUrl },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}`);
  }
}

const documentTypeLabels: Record<string, string> = {
  DRIVERS_LICENSE: '運転免許証',
  PASSPORT: 'パスポート',
  MYNUMBER_CARD: 'マイナンバーカード',
};

export async function sendIdentityVerificationNotification(
  email: string,
  handle: string,
  documentType: string,
  isResubmission: boolean,
): Promise<void> {
  if (!DISCORD_IDENTITY_WEBHOOK_URL) {
    console.warn('DISCORD_IDENTITY_WEBHOOK_URL is not set, skipping Discord notification');
    return;
  }

  const siteUrl = process.env.WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const label = documentTypeLabels[documentType] || documentType;

  const payload = {
    embeds: [
      {
        title: isResubmission ? '🔄 本人確認書類が再提出されました' : '📋 本人確認書類が提出されました',
        color: isResubmission ? 0xf59e0b : 0x3b82f6,
        fields: [
          { name: 'クリエイター', value: handle, inline: true },
          { name: 'メールアドレス', value: email, inline: true },
          { name: '書類タイプ', value: label, inline: true },
          { name: '管理画面', value: `${siteUrl}/admin/identity-verification` },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(DISCORD_IDENTITY_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}`);
  }
}
