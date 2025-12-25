import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";
import DashboardClient from "./dashboard-client";

interface DashboardPageProps {
    params: {
        handle: string;
    };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    // クリエイタープロフィールをhandleで取得
    const creator = await prisma.creatorProfile.findUnique({
        where: {
            handle: params.handle
        },
        select: {
            id: true,
            handle: true,
            displayName: true,
            userId: true
        }
    });

    if (!creator) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">クリエイターが見つかりません</p>
                    <p className="mt-2 text-sm text-gray-400">
                        指定されたハンドル名のクリエイターは存在しません
                    </p>
                </div>
            </div>
        );
    }

    // 本人確認: セッションのユーザーIDとクリエイターのユーザーIDが一致するか
    const sessionUserId = (session.user as any)?.id;
    if (creator.userId !== sessionUserId) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">アクセス権限がありません</p>
                    <p className="mt-2 text-sm text-gray-400">
                        このダッシュボードにはアクセスできません
                    </p>
                </div>
            </div>
        );
    }

    return <DashboardClient creatorId={creator.id} />;
}
