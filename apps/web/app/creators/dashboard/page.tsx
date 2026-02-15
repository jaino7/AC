import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/creators/login");
  }

  const userId = (session.user as any).id;

  // クリエイタープロフィールを取得
  let creator = await prisma.creatorProfile.findFirst({
    where: {
      user: {
        email: session.user.email
      }
    },
    select: {
      handle: true,
      userId: true
    }
  });

  // CreatorProfileが存在しない場合は自動作成（Google認証など）
  if (!creator && userId) {
    try {
      // handleを自動生成（emailの@より前 + ランダム数字）
      const emailPrefix = session.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(Math.random() * 10000);
      let handle = `${emailPrefix}${randomSuffix}`;

      // ハンドル名の重複チェック
      let handleExists = await prisma.creatorProfile.findUnique({
        where: { handle }
      });

      // 重複していたら再生成
      while (handleExists) {
        const newRandomSuffix = Math.floor(Math.random() * 10000);
        handle = `${emailPrefix}${newRandomSuffix}`;
        handleExists = await prisma.creatorProfile.findUnique({
          where: { handle }
        });
      }

      // CreatorProfileを作成
      creator = await prisma.creatorProfile.create({
        data: {
          userId: userId,
          handle: handle,
          displayName: session.user.name || emailPrefix,
          theme: 'creator-pro'
        },
        select: {
          handle: true,
          userId: true
        }
      });

      // ユーザーのroleをCREATORに更新
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'CREATOR' }
      });

      console.log(`CreatorProfile created for user ${userId} with handle: ${handle}`);
    } catch (error) {
      console.error("Error creating CreatorProfile:", error);
      console.error("Error details:", {
        message: (error as any)?.message,
        code: (error as any)?.code,
        userId,
        email: session.user.email
      });

      // ユニーク制約違反の場合は再取得を試みる（既に作成済みの可能性）
      try {
        creator = await prisma.creatorProfile.findUnique({
          where: { userId: userId },
          select: {
            handle: true,
            userId: true
          }
        });

        if (creator) {
          console.log(`Found existing CreatorProfile for user ${userId}: ${creator.handle}`);
        }
      } catch (fetchError) {
        console.error("Error fetching existing CreatorProfile:", fetchError);
      }

      // 再取得しても見つからない場合はエラーメッセージを表示
      if (!creator) {
        return (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">クリエイタープロフィールの作成に失敗しました</p>
              <p className="mt-2 text-sm text-gray-400">
                もう一度お試しいただくか、サポートにお問い合わせください
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-2 text-xs text-red-500">
                  エラー: {(error as any)?.message}
                </p>
              )}
            </div>
          </div>
        );
      }
    }
  }

  if (!creator) {
    // userIdが取得できない場合のフォールバック
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">プロフィールを作成できませんでした</p>
          <p className="mt-2 text-sm text-gray-400">
            再度ログインしてお試しください
          </p>
        </div>
      </div>
    );
  }

  // 新しいURL構造にリダイレクト
  redirect(`/creators/${creator.handle}/dashboard`);
}
