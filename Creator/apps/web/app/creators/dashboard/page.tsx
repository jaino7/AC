import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/creators/login");
  }

  // クリエイタープロフィールを取得
  const creator = await prisma.creatorProfile.findFirst({
    where: {
      user: {
        email: session.user.email
      }
    },
    select: {
      handle: true
    }
  });

  if (!creator) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">クリエイタープロフィールが見つかりません</p>
          <p className="mt-2 text-sm text-gray-400">
            まずプロフィールを作成してください
          </p>
        </div>
      </div>
    );
  }

  // 新しいURL構造にリダイレクト
  redirect(`/creators/${creator.handle}/dashboard`);
}
