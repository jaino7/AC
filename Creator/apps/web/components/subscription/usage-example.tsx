// 使用例: コンテンツ詳細ページ
"use client";

import { useState } from "react";
import { PlanSelectionModal } from "@/components/subscription/PlanSelectionModal";
import { ContentGuard } from "@/components/common/ContentGuard";

export default function ContentDetailPage({ content, plans, creatorId }: any) {
    const [modalOpen, setModalOpen] = useState(false);

    // TODO: 実際の認証状態を取得
    const isSubscribed = false; // useAuth() などから取得

    return (
        <div>
            <h1>{content.title}</h1>

            {/* ContentGuardでコンテンツを保護 */}
            <ContentGuard
                isPublic={content.visibility === "PUBLIC"}
                isSubscribed={isSubscribed}
                onSubscribeClick={() => setModalOpen(true)}
                planName={content.requiredPlan?.name}
            >
                {/* 実際のコンテンツ */}
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
            </ContentGuard>

            {/* プラン選択モーダル */}
            <PlanSelectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                plans={plans}
                creatorId={creatorId}
            />
        </div>
    );
}
