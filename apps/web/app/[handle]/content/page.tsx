import { prisma } from "@creator/shared";
import { notFound } from "next/navigation";
import { ThemeContentWrapper } from "./theme-wrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmailSafe } from "@/lib/email/client";
import { WelcomeEmail } from "@/lib/email/templates/fan/WelcomeEmail";



// export const revalidate = 0; // 常に最新のデータを取得
export const dynamic = "force-dynamic"; // キャッシュを無効化し、常に動的にレンダリング

interface ContentPageProps {
    params: { handle: string };
}

import { unstable_noStore as noStore } from "next/cache";

export default async function Page({ params }: ContentPageProps) {
    noStore(); // データのキャッシュを無効化

    // クリエイター情報を取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            id: true,
            handle: true,
            displayName: true,
            theme: true
        }
    });

    if (!creator) {
        notFound();
    }

    console.log(`[Content Page] Handle: ${params.handle}, Retrieved Theme: ${creator.theme}, Timestamp: ${new Date().toISOString()}`);


    // 認証セッションを取得
    const session = await getServerSession(authOptions);

    // ログイン中のユーザーがいる場合、FanProfileを確認・作成
    if (session?.user) {
        const userId = (session.user as any).id;

        if (userId) {
            try {
                // FanProfileが存在するか確認
                const existingFanProfile = await prisma.fanProfile.findUnique({
                    where: {
                        userId_creatorId: {
                            userId: userId,
                            creatorId: creator.id
                        }
                    }
                });

                // FanProfileが存在しない場合は作成（Google OAuthなど）
                if (!existingFanProfile) {
                    const displayName = session.user.name || session.user.email?.split("@")[0] || "ゲスト";

                    await prisma.fanProfile.create({
                        data: {
                            userId: userId,
                            creatorId: creator.id,
                            displayName: displayName,
                            credits: 0
                        }
                    });

                    console.log(`FanProfile created for user ${userId} and creator ${creator.handle}`);

                    // ウェルカムメール送信（fire and forget）
                    if (session.user.email) {
                        sendEmailSafe({
                            to: session.user.email,
                            subject: `${creator.displayName}のファンコミュニティへようこそ！`,
                            react: WelcomeEmail({
                                fanName: displayName,
                                creatorName: creator.displayName,
                                creatorHandle: creator.handle,
                            }),
                            emailType: 'FAN_EMAIL_VERIFICATION',
                            recipientId: userId,
                        }).catch((err) => console.error('Failed to send welcome email:', err));
                    }
                }
            } catch (error) {
                // FanProfile作成エラーはログに記録するが、ページ表示は継続
                console.error("Error ensuring FanProfile:", error);
            }
        }
    }

    // テーマに応じたコンテンツページをラッパー経由でレンダリング（リダイレクトなし）
    return <ThemeContentWrapper handle={creator.handle} initialTheme={creator.theme} />;
}
