import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { sendEmailSafe } from "@/lib/email/client";
import React from "react";
import DiscordInviteEmail from "@/lib/email/templates/discord-invite.template";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const body = await req.json();
    const { creatorIds, discordUrl } = body as {
      creatorIds: string[];
      discordUrl: string;
    };

    if (!creatorIds?.length || !discordUrl?.trim()) {
      return NextResponse.json(
        { error: "creatorIds と discordUrl は必須です" },
        { status: 400 }
      );
    }

    const creators = await prisma.creatorProfile.findMany({
      where: { id: { in: creatorIds } },
      select: {
        id: true,
        displayName: true,
        user: { select: { id: true, email: true } },
      },
    });

    let success = 0;
    let failed = 0;

    for (const creator of creators) {
      if (!creator.user.email) {
        failed++;
        continue;
      }
      const result = await sendEmailSafe({
        to: creator.user.email,
        subject:
          "【CocoBa】初期登録ありがとうございます！Discordコミュニティへご招待",
        react: React.createElement(DiscordInviteEmail, {
          recipientName: creator.displayName,
          discordUrl,
        }),
        emailType: "CREATOR_ANNOUNCEMENT",
        recipientId: creator.user.id,
        metadata: { discordUrl, creatorId: creator.id },
      });

      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    return NextResponse.json({ success, failed, total: creators.length });
  } catch (error) {
    console.error("Error sending discord invite emails:", error);
    return NextResponse.json(
      { error: "送信に失敗しました" },
      { status: 500 }
    );
  }
}
