import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/creators/[handle]/plans - プラン一覧取得
export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
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

        // 自分のプランのみアクセス可能
        if (creator.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // プラン一覧を取得
        const plans = await prisma.subscriptionPlan.findMany({
            where: { creatorId: creator.id },
            orderBy: { createdAt: "asc" },
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
        const formattedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            period: "monthly" as const,
            isPublic: true, // ※将来的にDBに追加する場合
            subscriberCount: plan._count.subscriptions,
            perks: Array.isArray(plan.features) ? plan.features : []
        }));

        return NextResponse.json(formattedPlans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/creators/[handle]/plans - プラン作成
export async function POST(
    request: NextRequest,
    { params }: { params: { handle: string } }
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

        // 自分のプランのみ作成可能
        if (creator.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // リクエストボディを解析
        const body = await request.json();
        const { name, description, price, perks } = body;

        // バリデーション
        if (!name || typeof price !== "number") {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // プラン作成
        const newPlan = await prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
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
                updatedAt: true
            }
        });

        // レスポンスの整形
        const formattedPlan = {
            id: newPlan.id,
            name: newPlan.name,
            description: newPlan.description,
            price: newPlan.price,
            period: "monthly" as const,
            isPublic: true,
            subscriberCount: 0,
            perks: Array.isArray(newPlan.features) ? newPlan.features : []
        };

        return NextResponse.json(formattedPlan, { status: 201 });
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
