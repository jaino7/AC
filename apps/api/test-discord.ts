import { config } from 'dotenv';
config();

async function testDiscordWebhook() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_BAN_INQUIRY;

  if (!webhookUrl) {
    console.error('❌ DISCORD_WEBHOOK_BAN_INQUIRY is not set in .env');
    return;
  }

  console.log('Testing Discord Webhook...');
  console.log('URL:', webhookUrl.substring(0, 50) + '...');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '🧪 テスト通知',
        embeds: [
          {
            title: '✅ Discord Webhook テスト成功',
            description: 'CocoBaからのテスト通知です。',
            color: 0x00ff00,
            fields: [
              {
                name: 'Status',
                value: 'Working correctly!',
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (response.ok) {
      console.log('✅ Discord notification sent successfully!');
      console.log('Check your Discord channel for the test message.');
    } else {
      const errorText = await response.text();
      console.error('❌ Discord webhook failed:', response.status);
      console.error('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDiscordWebhook();
