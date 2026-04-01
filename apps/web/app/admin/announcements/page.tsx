"use client";

import { useState, useEffect } from "react";

export default function AnnouncementsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetCount, setTargetCount] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetch("/api/admin/announcements")
            .then(r => r.json())
            .then(data => setTargetCount(data.targetCount ?? null))
            .catch(() => {});
    }, []);

    const handleSend = async () => {
        setIsSending(true);
        setResult(null);
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult({ success: true, message: data.message });
                setTitle("");
                setMessage("");
                // 送信後に対象数を再取得
                fetch("/api/admin/announcements")
                    .then(r => r.json())
                    .then(d => setTargetCount(d.targetCount ?? null))
                    .catch(() => {});
            } else {
                setResult({ success: false, message: data.error || "送信に失敗しました" });
            }
        } catch {
            setResult({ success: false, message: "通信エラーが発生しました" });
        } finally {
            setIsSending(false);
            setShowConfirm(false);
        }
    };

    return (
        <main className="px-6 py-10 lg:px-12">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">お知らせ一斉送信</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        全クリエイターのダッシュボード通知とメールにお知らせを送信します。
                    </p>
                    {targetCount !== null && (
                        <p className="mt-2 text-sm font-medium text-blue-600">
                            送信対象: {targetCount.toLocaleString()} 人のクリエイター（メール通知が有効な方）
                        </p>
                    )}
                </header>

                <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                                タイトル
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="例: システムメンテナンスのお知らせ"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                maxLength={200}
                            />
                            <p className="mt-1 text-xs text-gray-400">{title.length}/200文字</p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                                メッセージ
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="クリエイターへのお知らせ内容を入力してください..."
                                rows={8}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                maxLength={5000}
                            />
                            <p className="mt-1 text-xs text-gray-400">{message.length}/5000文字</p>
                        </div>

                        {result && (
                            <div
                                className={`rounded-xl px-4 py-3 text-sm ${
                                    result.success
                                        ? "bg-green-50 text-green-800"
                                        : "bg-red-50 text-red-800"
                                }`}
                            >
                                {result.message}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowConfirm(true)}
                                disabled={!title.trim() || !message.trim() || isSending}
                                className="rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                送信する
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 確認モーダル */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">送信の確認</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            {targetCount !== null ? `${targetCount.toLocaleString()} 人` : "全"}のクリエイターにこのお知らせを送信します。
                            この操作は取り消せません。
                        </p>
                        <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm">
                            <p className="font-semibold text-gray-900">{title}</p>
                            <p className="mt-1 text-gray-600 line-clamp-3">{message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 rounded-2xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isSending}
                                className="flex-1 rounded-2xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSending ? "送信中..." : "送信する"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
