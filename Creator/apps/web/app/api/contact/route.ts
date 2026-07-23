import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  category: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(10),
  policyAgreement: z.boolean().refine((val) => val === true),
});

// Category labels for Discord message
const categoryLabels: Record<string, string> = {
  account: "アカウント・ログイン",
  subscription: "サブスクリプション・決済",
  creator_usage: "クリエイター機能の使い方",
  fan_usage: "ファン機能の使い方",
  content: "コンテンツ管理・投稿",
  payment_issue: "支払い・請求について",
  technical: "技術的な問題・バグ報告",
  custom_domain: "カスタムドメイン",
  partnership: "提携・ビジネス相談",
  other: "その他",
};

async function sendDiscordNotification(data: z.infer<typeof contactSchema>) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_CONTACT;

  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_CONTACT is not configured");
    return;
  }

  const categoryLabel = categoryLabels[data.category] || data.category;

  const embed = {
    title: "📩 新しいお問い合わせ",
    color: 0x3b82f6, // Blue color
    fields: [
      {
        name: "お名前",
        value: data.name,
        inline: true,
      },
      {
        name: "メールアドレス",
        value: data.email,
        inline: true,
      },
      {
        name: "種別",
        value: categoryLabel,
        inline: false,
      },
      {
        name: "件名",
        value: data.subject,
        inline: false,
      },
      {
        name: "内容",
        value: data.message.length > 1000
          ? data.message.substring(0, 1000) + "..."
          : data.message,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "CocoBa お問い合わせフォーム",
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord webhook error:", response.status, errorText);
    }
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります" },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Send Discord notification
    await sendDiscordNotification(data);

    return NextResponse.json({
      success: true,
      message: "お問い合わせを受け付けました",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "お問い合わせの送信に失敗しました" },
      { status: 500 }
    );
  }
}
