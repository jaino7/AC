import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-24">
      <div className="text-center">
        <p className="text-base font-semibold text-red-600">403</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          アクセス権限がありません
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          このページにアクセスする権限がありません。
          <br />
          管理者権限が必要です。
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            ホームに戻る
          </Link>
          <Link href="/creators/dashboard" className="text-sm font-semibold text-gray-900">
            ダッシュボード <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
