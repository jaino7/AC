"use client";

import { TwitterIcon } from "./icons/twitter-icon";

interface TwitterShareButtonProps {
    url: string;
    text?: string;
    hashtags?: string[];
    via?: string;
    className?: string;
}

export function TwitterShareButton({
    url,
    text = "",
    hashtags = [],
    via,
    className = ""
}: TwitterShareButtonProps) {
    const handleShare = () => {
        const params = new URLSearchParams();
        params.append("url", url);

        if (text) {
            params.append("text", text);
        }

        if (hashtags.length > 0) {
            params.append("hashtags", hashtags.join(","));
        }

        if (via) {
            params.append("via", via);
        }

        const twitterUrl = `https://twitter.com/intent/tweet?${params.toString()}`;

        // 新しいウィンドウで開く
        window.open(
            twitterUrl,
            "twitter-share",
            "width=550,height=420,menubar=no,toolbar=no"
        );
    };

    return (
        <button
            onClick={handleShare}
            className={`inline-flex items-center gap-2 rounded-lg bg-[#1DA1F2] px-4 py-2 text-white transition-colors hover:bg-[#1a8cd8] ${className}`}
            aria-label="Twitterでシェア"
        >
            <TwitterIcon className="h-5 w-5" />
            <span className="text-sm font-medium">シェア</span>
        </button>
    );
}
