import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const fieldSchema = z.object({
    id: z.string().optional(),
    label: z.string().min(1, "ラベルを入力してください").max(100),
    type: z.enum(["text", "textarea", "select", "checkbox"]),
    required: z.boolean(),
    options: z.array(z.string()).default([]),
    order: z.number().int(),
});

const settingsSchema = z.object({
    inquiryEnabled: z.boolean(),
    fields: z.array(fieldSchema),
});

// GET /api/creators/[handle]/inquiry-settings
export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: {
                id: true,
                userId: true,
                inquiryEnabled: true,
                inquiryFormFields: {
                    orderBy: { order: "asc" },
                    select: { id: true, label: true, type: true, required: true, options: true, order: true }
                }
            }
        });

        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        if (creator.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            inquiryEnabled: creator.inquiryEnabled,
            fields: creator.inquiryFormFields,
        });
    } catch (error) {
        console.error("Error fetching inquiry settings:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/creators/[handle]/inquiry-settings
export async function PUT(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: { id: true, userId: true }
        });

        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        if (creator.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validation = settingsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0]?.message || "入力内容に誤りがあります" },
                { status: 400 }
            );
        }

        const { inquiryEnabled, fields } = validation.data;

        // トランザクションで設定更新と既存フィールドの置き換え
        await prisma.$transaction(async (tx) => {
            // inquiryEnabled を更新
            await tx.creatorProfile.update({
                where: { id: creator.id },
                data: { inquiryEnabled }
            });

            // 既存フィールドを全削除してから再作成
            await tx.inquiryFormField.deleteMany({
                where: { creatorId: creator.id }
            });

            if (fields.length > 0) {
                await tx.inquiryFormField.createMany({
                    data: fields.map((f, i) => ({
                        creatorId: creator.id,
                        label: f.label,
                        type: f.type,
                        required: f.required,
                        options: f.options,
                        order: i,
                    }))
                });
            }
        });

        // 更新後のデータを返す
        const updated = await prisma.creatorProfile.findUnique({
            where: { id: creator.id },
            select: {
                inquiryEnabled: true,
                inquiryFormFields: {
                    orderBy: { order: "asc" },
                    select: { id: true, label: true, type: true, required: true, options: true, order: true }
                }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error saving inquiry settings:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
