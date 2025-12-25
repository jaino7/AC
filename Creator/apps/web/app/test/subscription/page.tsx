"use client";

import { useState } from "react";
import { PlanSelectionModal } from "@/components/subscription/PlanSelectionModal";
import { ContentGuard } from "@/components/common/ContentGuard";

// テスト用のダミーデータ
const mockPlans = [
    {
        id: "plan_basic",
        name: "ベーシックプラン",
        price: 1000,
        description: "基本的なコンテンツにアクセスできます",
        features: [
            "すべての限定記事が読み放題",
            "月刊ニュースレター配信",
            "コミュニティへのアクセス",
        ],
    },
    {
        id: "plan_premium",
        name: "プレミアムプラン",
        price: 3000,
        description: "すべてのコンテンツと特典にアクセスできます",
        features: [
            "ベーシックプランの全特典",
            "限定動画コンテンツ",
            "月1回のオンライン勉強会参加権",
            "優先サポート",
        ],
    },
    {
        id: "plan_vip",
        name: "VIPプラン",
        price: 10000,
        description: "最上級の体験をお届けします",
        features: [
            "プレミアムプランの全特典",
            "個別コンサルティング（月1回）",
            "限定イベント招待",
            "早期アクセス権",
        ],
    },
];

const mockContent = {
    title: "【限定】プログラミング上達の秘訣",
    content: `
    <h2>はじめに</h2>
    <p>この記事では、プログラミングスキルを効率的に向上させるための実践的なテクニックを紹介します。</p>
    
    <h2>1. 毎日コードを書く習慣</h2>
    <p>継続は力なり。毎日少しずつでもコードを書くことで、確実にスキルが向上します。</p>
    
    <h2>2. プロジェクトベースで学ぶ</h2>
    <p>実際のプロジェクトを通じて学ぶことで、実践的なスキルが身につきます。</p>
    
    <h2>3. コードレビューを受ける</h2>
    <p>他の開発者からフィードバックをもらうことで、新しい視点を得られます。</p>
    
    <h2>4. オープンソースに貢献する</h2>
    <p>実際のプロジェクトに貢献することで、チーム開発のスキルも磨けます。</p>
    
    <h2>まとめ</h2>
    <p>これらのテクニックを実践することで、確実にスキルアップできます。</p>
  `,
};

export default function SubscriptionTestPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [contentType, setContentType] = useState<"public" | "premium">("premium");

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* ヘッダー */}
            <header className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        購読フロー テストページ
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        購読モーダルとコンテンツガードの動作確認
                    </p>
                </div>
            </header>

            {/* コントロールパネル */}
            <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="rounded-xl border-2 border-neutral-200 bg-white p-6">
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">
                        テストコントロール
                    </h2>

                    <div className="space-y-4">
                        {/* 購読状態切り替え */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                購読状態
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsSubscribed(false)}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${!isSubscribed
                                            ? "bg-red-600 text-white"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                        }`}
                                >
                                    未購読
                                </button>
                                <button
                                    onClick={() => setIsSubscribed(true)}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isSubscribed
                                            ? "bg-green-600 text-white"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                        }`}
                                >
                                    購読済み
                                </button>
                            </div>
                        </div>

                        {/* コンテンツタイプ切り替え */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                コンテンツタイプ
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setContentType("public")}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${contentType === "public"
                                            ? "bg-blue-600 text-white"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                        }`}
                                >
                                    公開記事
                                </button>
                                <button
                                    onClick={() => setContentType("premium")}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${contentType === "premium"
                                            ? "bg-purple-600 text-white"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                        }`}
                                >
                                    有料記事
                                </button>
                            </div>
                        </div>

                        {/* モーダル表示ボタン */}
                        <div>
                            <button
                                onClick={() => setModalOpen(true)}
                                className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-bold text-white hover:from-indigo-700 hover:to-purple-700 transition-all"
                            >
                                プラン選択モーダルを開く
                            </button>
                        </div>
                    </div>

                    {/* 現在の状態表示 */}
                    <div className="mt-6 rounded-lg bg-neutral-50 p-4">
                        <p className="text-xs font-semibold text-neutral-600 mb-2">
                            現在の状態:
                        </p>
                        <div className="space-y-1 text-sm">
                            <p>
                                購読状態:{" "}
                                <span
                                    className={`font-semibold ${isSubscribed ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {isSubscribed ? "購読済み" : "未購読"}
                                </span>
                            </p>
                            <p>
                                コンテンツ:{" "}
                                <span
                                    className={`font-semibold ${contentType === "public" ? "text-blue-600" : "text-purple-600"
                                        }`}
                                >
                                    {contentType === "public" ? "公開記事" : "有料記事"}
                                </span>
                            </p>
                            <p className="mt-2 text-xs text-neutral-500">
                                {contentType === "premium" && !isSubscribed
                                    ? "→ ContentGuardが表示されます"
                                    : "→ コンテンツが表示されます"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* コンテンツエリア */}
            <div className="mx-auto max-w-4xl px-4 py-6">
                <article className="rounded-xl border-2 border-neutral-200 bg-white p-8">
                    <h1 className="mb-4 text-3xl font-bold text-neutral-900">
                        {mockContent.title}
                    </h1>

                    <div className="mb-6 flex items-center gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${contentType === "public"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                        >
                            {contentType === "public" ? "無料" : "有料限定"}
                        </span>
                    </div>

                    {/* ContentGuardでコンテンツを保護 */}
                    <ContentGuard
                        isPublic={contentType === "public"}
                        isSubscribed={isSubscribed}
                        onSubscribeClick={() => setModalOpen(true)}
                        planName="プレミアムプラン"
                    >
                        <div
                            className="prose prose-neutral max-w-none"
                            dangerouslySetInnerHTML={{ __html: mockContent.content }}
                        />
                    </ContentGuard>
                </article>
            </div>

            {/* プラン選択モーダル */}
            <PlanSelectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                plans={mockPlans}
                creatorId="test-creator-id"
                userId="test-user-id"
            />
        </div>
    );
}
