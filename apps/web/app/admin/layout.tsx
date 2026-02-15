import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 現在のパスを取得（middlewareから渡される）
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  // ログインページはレイアウトを適用せずそのまま表示
  if (pathname.endsWith("/login") || pathname.includes("/login")) {
    return <>{children}</>;
  }

  // セッションチェック
  const session = await getServerSession(authOptions);

  // PathKeyを取得
  const adminPathKey = process.env.ADMIN_PATH_KEY || "";
  const adminBasePath = adminPathKey ? `/admin/${adminPathKey}` : "/admin";

  // ログインしていない場合は管理者ログインページへ
  if (!session?.user?.email) {
    redirect(`${adminBasePath}/login`);
  }

  // ユーザー情報とロールを取得
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // ユーザーが見つからない、またはADMINロールでない場合
  if (!user || user.role !== "ADMIN") {
    // 403 Forbidden ページへリダイレクト
    redirect("/forbidden");
  }

  // ADMIN ユーザーの場合のみ管理画面を表示
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Admin Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">管理画面</h1>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                ADMIN
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name || user.email}
              </span>
              <a
                href="/api/auth/signout"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ログアウト
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8">
            <a
              href={`${adminBasePath}/dashboard`}
              className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
            >
              ダッシュボード
            </a>
            <a
              href={`${adminBasePath}/identity-verification`}
              className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
            >
              本人確認審査
            </a>
            {/* 将来的に他の管理機能を追加する場合はここに追加 */}
            {/*
            <a href={`${adminBasePath}/users`} className="...">ユーザー管理</a>
            <a href={`${adminBasePath}/content`} className="...">コンテンツ監視</a>
            <a href={`${adminBasePath}/payments`} className="...">支払い管理</a>
            */}
          </div>
        </div>
      </nav>

      {/* Content */}
      {children}
    </div>
  );
}
