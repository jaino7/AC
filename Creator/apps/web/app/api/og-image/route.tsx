import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const handle = searchParams.get("handle") || "creator";
        const displayName = searchParams.get("name") || handle;
        const bio = searchParams.get("bio") || "クリエイター";
        const theme = searchParams.get("theme") || "creator-pro";

        // テーマに応じた背景色を設定
        const themeColors: Record<string, { bg: string; accent: string }> = {
            "creator-pro": { bg: "#1e40af", accent: "#3b82f6" },
            "neon-pro": { bg: "#7c3aed", accent: "#a78bfa" },
            "studio-pro": { bg: "#111827", accent: "#6b7280" },
            "velvet-pro": { bg: "#991b1b", accent: "#dc2626" },
            "pure-lite": { bg: "#ffffff", accent: "#000000" },
            "zine-lite": { bg: "#facc15", accent: "#eab308" }
        };

        const colors = themeColors[theme] || themeColors["creator-pro"];

        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: colors.bg,
                        backgroundImage: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent} 100%)`,
                        fontFamily: "sans-serif"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "40px"
                        }}
                    >
                        {/* アイコン */}
                        <div
                            style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "60px",
                                background: "rgba(255, 255, 255, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "64px",
                                marginBottom: "32px"
                            }}
                        >
                            👤
                        </div>

                        {/* 表示名 */}
                        <div
                            style={{
                                fontSize: "60px",
                                fontWeight: "bold",
                                color: "white",
                                marginBottom: "16px",
                                textAlign: "center"
                            }}
                        >
                            {displayName}
                        </div>

                        {/* ハンドル */}
                        <div
                            style={{
                                fontSize: "32px",
                                color: "rgba(255, 255, 255, 0.8)",
                                marginBottom: "32px"
                            }}
                        >
                            @{handle}
                        </div>

                        {/* バイオ */}
                        <div
                            style={{
                                fontSize: "28px",
                                color: "rgba(255, 255, 255, 0.9)",
                                textAlign: "center",
                                maxWidth: "800px",
                                lineHeight: "1.4"
                            }}
                        >
                            {bio}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630
            }
        );
    } catch (error) {
        console.error("OG Image generation error:", error);
        return new Response("Failed to generate image", { status: 500 });
    }
}
