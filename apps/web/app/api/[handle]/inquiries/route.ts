import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmailSafe } from "@/lib/email/client";
import { InquiryNotificationEmail } from "@/lib/email/templates/creator/InquiryNotificationEmail";
import React from "react";
import { z } from "zod";

const inquirySchema = z.object({
    fanName: z.string().min(1, "お名前を入力してください").max(100),
    fanEmail: z.string().email("有効なメールアドレスを入力してください"),
    message: z.string().min(1, "メッセージを入力してください").max(5000),
    fields: z.record(z.string()).optional(),
});

// POST /api/[handle]/inquiries - ファンがお問い合わせを送信
export async function POST(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        // クリエイターを取得
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: {
                id: true,
                displayName: true,
                inquiryEnabled: true,
                inquiryFormFields: {
                    orderBy: { order: "asc" },
                    select: { id: true, label: true, type: true, required: true, options: true, order: true }
                },
                user: {
                    select: { id: true, email: true }
                }
            }
        });

        if (!creator) {
            return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
        }

        if (!creator.inquiryEnabled) {
            return NextResponse.json({ error: "このクリエイターはお問い合わせを受け付けていません" }, { status: 403 });
        }

        const body = await request.json();
        const validation = inquirySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0]?.message || "入力内容に誤りがあります" },
                { status: 400 }
            );
        }

        const { fanName, fanEmail, message, fields } = validation.data;

        // カスタムフィールドの必須チェック
        for (const field of creator.inquiryFormFields) {
            if (field.required && (!fields || !fields[field.id])) {
                return NextResponse.json(
                    { error: `「${field.label}」は必須項目です` },
                    { status: 400 }
                );
            }
        }

        // ログインユーザーのID取得（任意）
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id ?? null;

        // お問い合わせをDBに保存
        const inquiry = await prisma.inquiry.create({
            data: {
                creatorId: creator.id,
                fanName,
                fanEmail,
                userId,
                message,
                fields: fields ? (fields as any) : undefined,
                status: "UNREAD",
            }
        });

        // クリエイターにダッシュボード通知を作成（非同期）
        prisma.notification.create({
            data: {
                creatorId: creator.id,
                type: "INQUIRY",
                title: "新しいお問い合わせが届きました",
                message: `${fanName}さんからお問い合わせが届きました`,
                metadata: {
                    inquiryId: inquiry.id,
                    fanName,
                    fanEmail,
                },
            },
        }).catch(err => console.error("Failed to create inquiry notification:", err));

        // クリエイターにメール通知（非同期）
        if (creator.user.email) {
            const customFields = creator.inquiryFormFields
                .filter(f => fields?.[f.id])
                .map(f => ({ label: f.label, value: fields![f.id] }));

            const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            const dashboardUrl = `${siteUrl}/creators/${params.handle}/inquiries`;

            sendEmailSafe({
                to: creator.user.email,
                subject: `【お問い合わせ】${fanName}さんからメッセージが届きました`,
                react: React.createElement(InquiryNotificationEmail, {
                    creatorName: creator.displayName,
                    fanName,
                    fanEmail,
                    message,
                    customFields,
                    dashboardUrl,
                }),
                emailType: "CREATOR_INQUIRY",
                recipientId: creator.user.id,
                metadata: { inquiryId: inquiry.id, handle: params.handle },
            }).catch(err => console.error("Inquiry email send failed:", err));
        }

        return NextResponse.json({ success: true, id: inquiry.id });
    } catch (error) {
        console.error("Inquiry submission error:", error);
        return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
    }
}

// GET /api/[handle]/inquiries - フォーム設定取得（ファン向け公開）
export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: {
                inquiryEnabled: true,
                inquiryFormFields: {
                    orderBy: { order: "asc" },
                    select: { id: true, label: true, type: true, required: true, options: true, order: true }
                }
            }
        });

        if (!creator) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({
            inquiryEnabled: creator.inquiryEnabled,
            fields: creator.inquiryFormFields,
        });
    } catch (error) {
        console.error("Inquiry settings fetch error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
