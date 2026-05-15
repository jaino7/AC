"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ThemeContentWrapper } from "./theme-wrapper";
import StudioProContentPage from "@/app/studio-pro/content/page";
import { AgeGate } from "@/components/common/AgeGate";

export default function ContentPage() {
    const params = useParams();
    const handle = params.handle as string;

    if (handle === "demo") {
        return <StudioProContentPage />;
    }

    return <LiveContentPage handle={handle} />;
}

function LiveContentPage({ handle }: { handle: string }) {

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

    const profile = data?.profile;
    const theme = profile?.theme || "creator-pro";

    if (!handle || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-neutral-500">読み込み中...</p>
            </div>
        );
    }

    return (
        <AgeGate
            isRequired={Boolean(profile?.isAdultContent)}
            creatorHandle={handle}
            creatorName={profile?.displayName}
        >
            <ThemeContentWrapper handle={handle} initialTheme={theme} />
        </AgeGate>
    );
}
