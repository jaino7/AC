import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  // 統計データを取得
  const [
    totalUsers,
    totalCreators,
    pendingVerifications,
    totalPosts,
    todayRevenue,
    activeSubscriptions,
  ] = await Promise.all([
    // 総ユーザー数
    prisma.user.count(),

    // クリエイター数
    prisma.creatorProfile.count(),

    // 本人確認待ち
    prisma.identityVerification.count({
      where: { status: "PENDING" },
    }),

    // 投稿数
    prisma.post.count(),

    // 今日の収益（Purchase + Transaction）
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [purchases, transactions] = await Promise.all([
        prisma.purchase.aggregate({
          where: {
            purchasedAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            status: "PAID",
            paidAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          _sum: { amount: true },
        }),
      ]);

      return (purchases._sum.amount || 0) + (transactions._sum.amount || 0);
    })(),

    // アクティブなサブスク
    prisma.subscription.count({
      where: { status: "ACTIVE" },
    }),
  ]);

  // 最近のアクティビティ
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      creator: {
        select: {
          displayName: true,
        },
      },
    },
  });

  return (
    <main className="px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* ページヘッダー */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-sm text-gray-600">
            システム全体の統計と最近のアクティビティ
          </p>
        </header>

        {/* 統計カード */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 総ユーザー数 */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* クリエイター数 */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">クリエイター数</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalCreators.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 本人確認待ち */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">本人確認待ち</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {pendingVerifications.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            {pendingVerifications > 0 && (
              <a
                href="/admin/identity-verification"
                className="mt-3 block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                審査に進む →
              </a>
            )}
          </div>

          {/* 投稿数 */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総投稿数</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalPosts.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 今日の収益 */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">本日の収益</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ¥{todayRevenue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* アクティブサブスク */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブサブスク</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activeSubscriptions.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 最近登録されたユーザー */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              最近登録されたユーザー
            </h2>
            <div className="space-y-3">
              {recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${user.role === "ADMIN"
                        ? "bg-red-100 text-red-800"
                        : user.role === "CREATOR"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 最近の投稿 */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              最近の投稿
            </h2>
            <div className="space-y-3">
              {recentPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-gray-200 p-3"
                >
                  <p className="font-medium text-gray-900">{post.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {post.creator.displayName} •{" "}
                    {new Date(post.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
