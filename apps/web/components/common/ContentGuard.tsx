"use client";

import { ReactNode } from "react";
import { Lock, CreditCard } from "lucide-react";

interface ContentGuardProps {
    children: ReactNode;
    isPublic: boolean;
    isSubscribed?: boolean;
    onSubscribeClick?: () => void;
    planName?: string;
}

export function ContentGuard({
    children,
    isPublic,
    isSubscribed = false,
    onSubscribeClick,
    planName = "有料プラン",
}: ContentGuardProps) {
    // 公開記事または購読済みの場合はそのまま表示
    if (isPublic || isSubscribed) {
        return <>{children}</>;
    }

    // 未購読 & 有料記事の場合はロックされた状態を表示
    return (
        <div className="relative">
            {/* コンテンツをブラーで表示 */}
            <div className="pointer-events-none select-none blur-md opacity-40">
                {children}
            </div>

            {/* オーバーレイCTA */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-md mx-4">
                    <div className="rounded-2xl bg-white shadow-2xl border-2 border-neutral-200 p-8 text-center">
                        {/* アイコン */}
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Lock className="h-8 w-8 text-white" />
                        </div>

                        {/* メッセージ */}
                        <h3 className="mb-2 text-2xl font-bold text-neutral-900">
                            この先は{planName}限定コンテンツです
                        </h3>
                        <p className="mb-6 text-sm text-neutral-600">
                            続きを読むには、プランに加入してください
                        </p>

                        {/* CTAボタン */}
                        <button
                            onClick={onSubscribeClick}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-bold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <CreditCard className="h-5 w-5" />
                            プランに加入して続きを読む
                        </button>

                        {/* 特典リスト */}
                        <div className="mt-6 space-y-2 text-left">
                            <p className="text-xs font-semibold text-neutral-700 mb-2">
                                プラン加入で得られる特典：
                            </p>
                            <div className="space-y-1 text-xs text-neutral-600">
                                <p>✓ すべての限定コンテンツが読み放題</p>
                                <p>✓ 過去の記事アーカイブへのアクセス</p>
                                <p>✓ 新着コンテンツの優先通知</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
