"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ThemeContentWrapper } from "./theme-wrapper";

export default function ContentPage() {
    const params = useParams();
    const handle = params.handle as string;

    // クリエイターのテーマを取得
    const { data, isLoading } = useQuery({
        queryKey: ["creator-theme", handle],
        queryFn: async () => {
            const res = await fetch(`/api/creators/profile?handle=${handle}`);
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        },
        enabled: !!handle,
    });

    const theme = data?.profile?.theme || "creator-pro";

    if (!handle || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-neutral-500">読み込み中...</p>
            </div>
        );
    }

    return <ThemeContentWrapper handle={handle} initialTheme={theme} />;
}
