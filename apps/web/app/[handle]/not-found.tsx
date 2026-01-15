import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white">
            <h1 className="text-6xl font-bold">404</h1>
            <p className="mt-4 text-xl text-neutral-400">
                クリエイターが見つかりませんでした
            </p>
            <p className="mt-2 text-sm text-neutral-500">
                指定されたハンドル名のクリエイターは存在しません
            </p>
            <Link
                href="/"
                className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
                トップページへ戻る
            </Link>
        </div>
    );
}
