"use client";

import { useEffect } from "react";

interface PageViewTrackerProps {
    creatorId: string;
    path: string;
}

export function PageViewTracker({ creatorId, path }: PageViewTrackerProps) {
    useEffect(() => {
        // ページビューを記録
        const recordPageView = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                await fetch(`${apiUrl}/creators/page-views`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        creatorId,
                        path,
                        userAgent: navigator.userAgent,
                        referer: document.referrer || undefined
                    })
                });
            } catch (error) {
                // エラーは静かに無視（トラッキングはベストエフォート）
                console.debug("Page view tracking failed:", error);
            }
        };

        recordPageView();
    }, [creatorId, path]);

    return null; // UIは表示しない
}
