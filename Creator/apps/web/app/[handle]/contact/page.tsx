"use client";

import { useParams } from "next/navigation";
import { InquiryForm } from "@/components/InquiryForm";
import { useEffect, useState } from "react";

interface CreatorInfo {
    displayName: string;
    theme: string;
}

export default function ContactPage() {
    const params = useParams();
    const handle = params.handle as string;
    const [creator, setCreator] = useState<CreatorInfo | null>(null);

    useEffect(() => {
        // テーマ情報を取得
        fetch(`/api/creators/${handle}/theme`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) setCreator({ displayName: handle, theme: data.theme });
            })
            .catch(() => {});
    }, [handle]);

    const isDark = !creator?.theme || ["creator-pro", "neon-pro", "studio-pro"].includes(creator.theme);

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-lg mx-auto">
                <InquiryForm handle={handle} theme={creator?.theme} />
            </div>
        </div>
    );
}
