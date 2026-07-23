import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/creators/[handle]/plans/[id] - プラン更新
export async function PUT(
    request: NextRequest,
    { params }: { params: { handle: string; id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // handle に対応する creator を取得
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: { id: true, userId: true }
        });

        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        // 自分のプランのみ更新可能
        if (creator.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // プランの所有者確認
        const existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: params.id },
            select: { creatorId: true }
        });

        if (!existingPlan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        if (existingPlan.creatorId !== creator.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // リクエストボディを解析
        const body = await request.json();
        const { name, description, price, perks } = body;

        // バリデーション
        if (!name || typeof price !== "number") {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // プラン更新
        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id: params.id },
            data: {
                name,
                description: description || null,
                price,
                features: perks || []
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                features: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        subscriptions: true
                    }
                }
            }
        });

        // レスポンスの整形
        const formattedPlan = {
            id: updatedPlan.id,
            name: updatedPlan.name,
            description: updatedPlan.description,
            price: updatedPlan.price,
            period: "monthly" as const,
            isPublic: true,
            subscriberCount: updatedPlan._count.subscriptions,
            perks: Array.isArray(updatedPlan.features) ? updatedPlan.features : []
        };

        return NextResponse.json(formattedPlan);
    } catch (error) {
        console.error("Error updating plan:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/creators/[handle]/plans/[id] - プラン削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: { handle: string; id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // handle に対応する creator を取得
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: { id: true, userId: true }
        });

        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        // 自分のプランのみ削除可能
        if (creator.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // プランの所有者確認
        const existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: params.id },
            select: { creatorId: true }
        });

        if (!existingPlan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        if (existingPlan.creatorId !== creator.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // プラン削除
        await prisma.subscriptionPlan.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting plan:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
