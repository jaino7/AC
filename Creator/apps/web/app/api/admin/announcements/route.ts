import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { sendEmailSafe } from "@/lib/email/client";
import { AnnouncementEmail } from "@/lib/email/templates/creator/AnnouncementEmail";
import React from "react";

// POST - 全クリエイターにお知らせを一斉送信
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        // ADMINロール確認
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "権限がありません" }, { status: 403 });
        }

        const body = await request.json();
        const { title, message } = body;

        if (!title?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "タイトルとメッセージは必須です" }, { status: 400 });
        }

        // notifyAnnouncement が有効なクリエイターを取得
        const creators = await prisma.creatorProfile.findMany({
            where: { notifyAnnouncement: true },
            select: {
                id: true,
                displayName: true,
                user: { select: { id: true, email: true } },
            },
        });

        let notifiedCount = 0;
        let emailSentCount = 0;

        // 各クリエイターへ通知を作成・メール送信（順次処理）
        for (const creator of creators) {
            // ダッシュボード通知を作成
            await prisma.notification.create({
                data: {
                    creatorId: creator.id,
                    type: "ANNOUNCEMENT",
                    title,
                    message,
                },
            }).catch(err => console.error(`Failed to create announcement for ${creator.id}:`, err));

            notifiedCount++;

            // メール送信
            if (creator.user.email) {
                await sendEmailSafe({
                    to: creator.user.email,
                    subject: `【CocoBaからのお知らせ】${title}`,
                    react: React.createElement(AnnouncementEmail, {
                        creatorName: creator.displayName,
                        title,
                        message,
                    }),
                    emailType: "CREATOR_ANNOUNCEMENT",
                    recipientId: creator.user.id,
                    metadata: { announcementTitle: title },
                }).catch(err => console.error(`Failed to send announcement email to ${creator.user.email}:`, err));

                emailSentCount++;
            }
        }

        return NextResponse.json({
            success: true,
            notifiedCount,
            emailSentCount,
            message: `${notifiedCount}人のクリエイターに通知を送信しました（メール: ${emailSentCount}件）`,
        });
    } catch (error) {
        console.error("Announcement send error:", error);
        return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
    }
}

// GET - 送信対象クリエイター数を取得（プレビュー用）
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "権限がありません" }, { status: 403 });
        }

        const count = await prisma.creatorProfile.count({
            where: { notifyAnnouncement: true },
        });

        return NextResponse.json({ targetCount: count });
    } catch (error) {
        console.error("Announcement count error:", error);
        return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
    }
}
