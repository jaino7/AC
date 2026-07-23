import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { sendEmailSafe } from "@/lib/email/client";
import { DepositSuccessEmail } from "@/lib/email/templates/fan/DepositSuccessEmail";

// POST - Approve a charge request
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "管理者権限が必要です" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { transferorName, transferDate } = body;

        if (!transferorName || !transferDate) {
            return NextResponse.json(
                { error: "振込人名義と振込日時は必須です" },
                { status: 400 }
            );
        }

        const chargeRequestId = params.id;

        // Get charge request
        const chargeRequest = await prisma.chargeRequest.findUnique({
            where: { id: chargeRequestId },
            include: {
                fan: {
                    select: {
                        id: true,
                        displayName: true,
                        credits: true,
                        trustScore: true,
                        tier: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        });

        if (!chargeRequest) {
            return NextResponse.json(
                { error: "チャージ申請が見つかりません" },
                { status: 404 }
            );
        }

        if (chargeRequest.status === "APPROVED") {
            return NextResponse.json(
                { error: "このチャージ申請は既に承認されています" },
                { status: 400 }
            );
        }

        if (chargeRequest.status === "REJECTED" || chargeRequest.status === "EXPIRED") {
            return NextResponse.json(
                { error: "このチャージ申請は承認できません" },
                { status: 400 }
            );
        }

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Update charge request
            const updatedRequest = await tx.chargeRequest.update({
                where: { id: chargeRequestId },
                data: {
                    status: "APPROVED",
                    transferorName,
                    transferDate: new Date(transferDate),
                    approvedBy: user.id,
                    approvedAt: new Date()
                }
            });

            // Calculate new trust score and tier
            const newTrustScore = chargeRequest.fan.trustScore + 1;
            let newTier = chargeRequest.fan.tier;

            if (newTrustScore >= 3 && chargeRequest.fan.tier < 2) {
                newTier = 2; // Premium
            } else if (newTrustScore >= 1 && chargeRequest.fan.tier < 1) {
                newTier = 1; // Trusted
            }

            // Update fan credit balance, trustScore, and tier
            const newBalance = chargeRequest.fan.credits + chargeRequest.amount;
            await tx.fanProfile.update({
                where: { id: chargeRequest.fanId },
                data: {
                    credits: newBalance,
                    trustScore: newTrustScore,
                    tier: newTier
                }
            });

            // Create credit history
            await tx.creditHistory.create({
                data: {
                    fanId: chargeRequest.fanId,
                    type: "CHARGE",
                    amount: chargeRequest.amount,
                    balance: newBalance,
                    description: `クレジットチャージ`,
                    chargeRequestId: chargeRequest.id
                }
            });

            return { updatedRequest, newBalance };
        });

        // Send credit notification email to fan
        const fan = chargeRequest.fan;
        const fanUser = fan?.user;
        if (fanUser?.email) {
            try {
                await sendEmailSafe({
                    to: fanUser.email,
                    subject: `${chargeRequest.amount.toLocaleString('ja-JP')}円クレジットされました`,
                    react: DepositSuccessEmail({
                        fanName: fan.displayName || fanUser.name || 'ファン',
                        amount: chargeRequest.amount,
                        balance: result.newBalance,
                    }),
                    emailType: 'FAN_RECEIPT',
                    recipientId: fanUser.id,
                    metadata: {
                        chargeRequestId: chargeRequest.id,
                        amount: chargeRequest.amount,
                    },
                });
            } catch (emailError) {
                console.error('Failed to send credit notification email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            chargeRequest: result.updatedRequest,
            newBalance: result.newBalance
        });
    } catch (error) {
        console.error("Error approving charge request:", error);
        return NextResponse.json(
            { error: "チャージ申請の承認に失敗しました" },
            { status: 500 }
        );
    }
}
