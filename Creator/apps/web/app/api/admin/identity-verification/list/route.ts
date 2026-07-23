import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // 認証チェック
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // TODO: 管理者権限チェック（実装に応じて調整）
        // const user = await prisma.user.findUnique({
        //     where: { email: session.user.email },
        // });
        // if (user?.role !== "ADMIN") {
        //     return NextResponse.json(
        //         { error: "管理者権限が必要です" },
        //         { status: 403 }
        //     );
        // }

        // 本人確認申請の一覧を取得
        const verifications = await prisma.identityVerification.findMany({
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        handle: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // レスポンス用にデータを整形
        const formattedVerifications = verifications.map((v: any) => ({
            id: v.id,
            creatorId: v.creatorId,
            creatorName: v.creator.displayName || v.creator.handle,
            documentType: v.documentType,
            frontImageKey: v.frontImageKey,
            backImageKey: v.backImageKey,
            status: v.status,
            submittedAt: v.createdAt.toISOString(),
            reviewedAt: v.reviewedAt?.toISOString(),
            rejectionReason: v.rejectReason,
        }));

        return NextResponse.json({
            success: true,
            verifications: formattedVerifications,
        });
    } catch (error) {
        console.error("Failed to load verifications:", error);
        return NextResponse.json(
            { error: "申請一覧の取得に失敗しました" },
            { status: 500 }
        );
    }
}
