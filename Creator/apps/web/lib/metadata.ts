import { Metadata } from "next";

interface GenerateCreatorMetadataProps {
    handle: string;
    displayName: string;
    bio?: string;
    theme?: string;
    customDomain?: string;
}

export function generateCreatorMetadata({
    handle,
    displayName,
    bio = "",
    theme = "creator-pro",
    customDomain
}: GenerateCreatorMetadataProps): Metadata {
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    const pageUrl = customDomain
        ? `https://${customDomain}`
        : `${baseUrl}/creators/${handle}`;

    const ogImageUrl = `${baseUrl}/api/og-image?handle=${encodeURIComponent(handle)}&name=${encodeURIComponent(displayName)}&bio=${encodeURIComponent(bio)}&theme=${theme}`;

    const title = `${displayName} (@${handle})`;
    const description = bio || `${displayName}のクリエイターページ`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: "ACD Creator",
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: displayName
                }
            ],
            locale: "ja_JP",
            type: "profile"
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImageUrl],
            creator: `@${handle}`
        }
    };
}
