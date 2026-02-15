import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get or create virtual account for credit charging
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Get URL to extract handle if available
        const url = new URL(request.url);
        const handle = url.searchParams.get("handle");

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        let fanProfile;

        if (handle) {
            // Find creator by handle
            const creator = await prisma.creatorProfile.findUnique({
                where: { handle },
                select: { id: true },
            });

            if (!creator) {
                return NextResponse.json(
                    { error: "クリエイターが見つかりません" },
                    { status: 404 }
                );
            }

            // Find fan profile for this creator
            fanProfile = await prisma.fanProfile.findUnique({
                where: {
                    userId_creatorId: {
                        userId: user.id,
                        creatorId: creator.id,
                    },
                },
                select: { id: true },
            });

            if (!fanProfile) {
                return NextResponse.json(
                    { error: "ファンプロフィールが見つかりません" },
                    { status: 404 }
                );
            }
        } else {
            // Legacy: Use first fan profile (for backward compatibility)
            const fanProfiles = await prisma.fanProfile.findMany({
                where: { userId: user.id },
                select: { id: true },
                take: 1,
            });

            if (fanProfiles.length === 0) {
                return NextResponse.json(
                    { error: "ファンプロフィールが見つかりません" },
                    { status: 404 }
                );
            }

            fanProfile = fanProfiles[0];
        }

        // Check if there's already an active virtual account assigned to this fan
        let virtualAccount = await prisma.virtualAccount.findFirst({
            where: {
                fanId: fanProfile.id,
                purpose: "FAN_CREDIT",
                isActive: true,
            },
        });

        // Check if the assigned account is a dummy (accountNumber starts with "VA" followed by timestamp)
        const isDummyAccount = virtualAccount && virtualAccount.accountNumber.startsWith("VA") && /^VA\d+/.test(virtualAccount.accountNumber);

        // If no real account is assigned, take one from the pool
        if (!virtualAccount || isDummyAccount) {
            // If there's a dummy account, unassign it first
            if (isDummyAccount && virtualAccount) {
                await prisma.virtualAccount.update({
                    where: { id: virtualAccount.id },
                    data: { fanId: null, isActive: false },
                });
            }

            // Find an unassigned real account from the pool
            virtualAccount = await prisma.virtualAccount.findFirst({
                where: {
                    fanId: null,
                    purpose: "FAN_CREDIT",
                    isActive: true,
                    accountNumber: {
                        not: {
                            startsWith: "VA",
                        },
                    },
                },
            });

            if (!virtualAccount) {
                return NextResponse.json(
                    { error: "現在、入金窓口が大変混み合っております。数時間後にもう一度お試しください" },
                    { status: 503 }
                );
            }

            // Assign this real account to the fan
            virtualAccount = await prisma.virtualAccount.update({
                where: { id: virtualAccount.id },
                data: { fanId: fanProfile.id },
            });
        }

        // Bank information
        const bankInfo = {
            bankName: "GMOあおぞらネット銀行",
            branchName: virtualAccount.branchName || "法人第一営業部",
            branchCode: virtualAccount.branchCode || "001",
            accountType: "普通",
            accountNumber: virtualAccount.accountNumber,
            accountHolder: virtualAccount.accountName,
        };

        return NextResponse.json({
            virtualAccount: {
                id: virtualAccount.id,
                accountNumber: virtualAccount.accountNumber,
                bankInfo,
                instructions: "この口座に振り込んだ金額が自動的にクレジットとしてチャージされます。\n振込名義人は登録されている氏名をご利用ください。",
            },
        });
    } catch (error) {
        console.error("Error getting virtual account:", error);
        return NextResponse.json(
            { error: "仮想口座の取得に失敗しました" },
            { status: 500 }
        );
    }
}
