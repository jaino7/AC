const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

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
