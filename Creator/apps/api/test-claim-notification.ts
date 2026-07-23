import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function testClaimNotification() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_PAYMENT;

  if (!webhookUrl) {
    console.error('❌ DISCORD_WEBHOOK_PAYMENT is not set in .env');
    return;
  }

  console.log('Testing Claim Notification...');
  console.log('URL:', webhookUrl.substring(0, 50) + '...');

  // Fetch real virtual accounts from database
  console.log('Fetching virtual accounts from database...');
  const virtualAccounts = await prisma.virtualAccount.findMany({
    where: {
      isActive: true,
    },
    take: 3,
    orderBy: { createdAt: 'asc' },
  });

  if (virtualAccounts.length === 0) {
    console.error('❌ No virtual accounts found in database');
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ Found ${virtualAccounts.length} virtual accounts`);

  // Test cases for different tiers
  const testCases = [
    {
      name: 'ティア0 - 全額保留',
      data: {
        userId: 'test-user-123',
        userName: 'テストユーザー (ティア0)',
        userEmail: 'tier0@example.com',
        amount: 5000,
        tier: 0,
        trustScore: 0,
        immediateCredit: 0,
        pendingCredit: 5000,
        creatorHandle: 'test-creator',
        virtualAccount: virtualAccounts[0] ? {
          accountNumber: virtualAccounts[0].accountNumber,
          branchCode: virtualAccounts[0].branchCode,
          branchName: virtualAccounts[0].branchName,
        } : undefined,
      },
      tier: 0,
      color: 0xff5555,
    },
    {
      name: 'ティア1 - 一部即時反映',
      data: {
        userId: 'test-user-456',
        userName: 'テストユーザー (ティア1)',
        userEmail: 'tier1@example.com',
        amount: 5000,
        tier: 1,
        trustScore: 1,
        immediateCredit: 3000,
        pendingCredit: 2000,
        creatorHandle: 'test-creator',
        virtualAccount: virtualAccounts[1] || virtualAccounts[0] ? {
          accountNumber: (virtualAccounts[1] || virtualAccounts[0]).accountNumber,
          branchCode: (virtualAccounts[1] || virtualAccounts[0]).branchCode,
          branchName: (virtualAccounts[1] || virtualAccounts[0]).branchName,
        } : undefined,
      },
      tier: 1,
      color: 0xffaa00,
    },
    {
      name: 'ティア2 - 全額即時反映',
      data: {
        userId: 'test-user-789',
        userName: 'テストユーザー (ティア2)',
        userEmail: 'tier2@example.com',
        amount: 15000,
        tier: 2,
        trustScore: 5,
        immediateCredit: 15000,
        pendingCredit: 0,
        creatorHandle: 'test-creator',
        virtualAccount: virtualAccounts[2] || virtualAccounts[0] ? {
          accountNumber: (virtualAccounts[2] || virtualAccounts[0]).accountNumber,
          branchCode: (virtualAccounts[2] || virtualAccounts[0]).branchCode,
          branchName: (virtualAccounts[2] || virtualAccounts[0]).branchName,
        } : undefined,
      },
      tier: 2,
      color: 0x55ff55,
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📤 Sending: ${testCase.name}...`);

    const { data, tier, color } = testCase;
    const tierLabels = ['新規', '信頼済み', '優良'];
    const tierLabel = tierLabels[tier] || '不明';

    // Build status message
    let statusMessage = '';
    if (tier === 0) {
      statusMessage = `全額保留中 (¥${data.amount.toLocaleString()})\n振込確認後に付与されます`;
    } else if (tier === 1) {
      if (data.immediateCredit > 0) {
        statusMessage = `✅ 即時反映済: ¥${data.immediateCredit.toLocaleString()}`;
        if (data.pendingCredit > 0) {
          statusMessage += `\n⏳ 保留中: ¥${data.pendingCredit.toLocaleString()}`;
        }
      } else {
        statusMessage = `全額保留中 (¥${data.amount.toLocaleString()})`;
      }
    } else {
      if (data.immediateCredit > 0) {
        statusMessage = `✅ 即時反映済: ¥${data.immediateCredit.toLocaleString()}`;
        if (data.pendingCredit > 0) {
          statusMessage += `\n⏳ 保留中: ¥${data.pendingCredit.toLocaleString()}`;
        }
      } else {
        statusMessage = `全額反映済 (¥${data.amount.toLocaleString()})`;
      }
    }

    const fields = [
      {
        name: '👤 ユーザー情報',
        value: `**名前:** ${data.userName}\n**メール:** ${data.userEmail}\n**ID:** \`${data.userId}\``,
        inline: false,
      },
      {
        name: '📊 信用情報',
        value: `**ティア:** ${tier} (${tierLabel})\n**スコア:** ${data.trustScore}`,
        inline: true,
      },
    ];

    // Only show amount for tier 1 and above
    if (tier > 0) {
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

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [
            {
              title: tier === 0 ? '📢 振込申告 (ティア0)' : '📢 チャージ申告',
              description: tier === 0
                ? 'ティア0ユーザーが「振り込みました」ボタンを押しました。'
                : 'ユーザーが「申告する」ボタンを押しました。',
              color: color,
              fields: fields,
              footer: {
                text: 'CocoBa Trust & Lock System',
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (response.ok) {
        console.log(`✅ ${testCase.name} - 送信成功`);
      } else {
        const errorText = await response.text();
        console.error(`❌ ${testCase.name} - 送信失敗:`, response.status);
        console.error('Error:', errorText);
      }

      // Wait 1 second between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ ${testCase.name} - エラー:`, error);
    }
  }

  console.log('\n✅ All test notifications sent!');
  console.log('Check your Discord channel for the test messages.');

  await prisma.$disconnect();
}

testClaimNotification();
