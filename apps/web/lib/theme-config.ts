/**
 * テーマ設定のスキーマ定義
 */
export interface ThemeConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    layout: {
        maxWidth: string;
        spacing: string;
    };
}

/**
 * デフォルトテーマ設定
 */
export const DEFAULT_THEME_CONFIGS: Record<string, ThemeConfig> = {
    "creator-pro": {
        colors: {
            primary: "#3b82f6",
            secondary: "#1e40af",
            accent: "#60a5fa",
            background: "#ffffff",
            text: "#1f2937"
        },
        fonts: {
            heading: "Inter, sans-serif",
            body: "Inter, sans-serif"
        },
        layout: {
            maxWidth: "1280px",
            spacing: "1rem"
        }
    },
    "neon-pro": {
        colors: {
            primary: "#a78bfa",
            secondary: "#7c3aed",
            accent: "#c4b5fd",
            background: "#18181b",
            text: "#f4f4f5"
        },
        fonts: {
            heading: "Outfit, sans-serif",
            body: "Inter, sans-serif"
        },
        layout: {
            maxWidth: "1280px",
            spacing: "1rem"
        }
    },
    "studio-pro": {
        colors: {
            primary: "#6b7280",
            secondary: "#111827",
            accent: "#9ca3af",
            background: "#ffffff",
            text: "#111827"
        },
        fonts: {
            heading: "Roboto, sans-serif",
            body: "Roboto, sans-serif"
        },
        layout: {
            maxWidth: "1280px",
            spacing: "1rem"
        }
    },
    "velvet-pro": {
        colors: {
            primary: "#dc2626",
            secondary: "#991b1b",
            accent: "#f87171",
            background: "#fef2f2",
            text: "#7f1d1d"
        },
        fonts: {
            heading: "Playfair Display, serif",
            body: "Inter, sans-serif"
        },
        layout: {
            maxWidth: "1280px",
            spacing: "1rem"
        }
    },
    "pure-lite": {
        colors: {
            primary: "#000000",
            secondary: "#374151",
            accent: "#6b7280",
            background: "#ffffff",
            text: "#000000"
        },
        fonts: {
            heading: "Inter, sans-serif",
            body: "Inter, sans-serif"
        },
        layout: {
            maxWidth: "1280px",
            spacing: "1rem"
        }
    },
    "zine-lite": {
        colors: {
            primary: "#eab308",
            secondary: "#ca8a04",
            accent: "#fde047",
            background: "#fffbeb",
            text: "#713f12"
        },
        fonts: {
            heading: "Outfit, sans-serif",
            body: "Inter, sans-serif"
        },
        layout: {
            maxWidth: "1280px",
            spacing: "1rem"
        }
    }
};

/**
 * テーマ設定をCSS変数に変換
 */
export function themeConfigToCSS(config: ThemeConfig): string {
    return `
    --color-primary: ${config.colors.primary};
    --color-secondary: ${config.colors.secondary};
    --color-accent: ${config.colors.accent};
    --color-background: ${config.colors.background};
    --color-text: ${config.colors.text};
    --font-heading: ${config.fonts.heading};
    --font-body: ${config.fonts.body};
    --layout-max-width: ${config.layout.maxWidth};
    --layout-spacing: ${config.layout.spacing};
  `.trim();
}

/**
 * テーマ設定を取得（デフォルト値とマージ）
 */
export function getThemeConfig(
    theme: string,
    customConfig?: Partial<ThemeConfig>
): ThemeConfig {
    const defaultConfig = DEFAULT_THEME_CONFIGS[theme] || DEFAULT_THEME_CONFIGS["creator-pro"];

    if (!customConfig) {
        return defaultConfig;
    }

    return {
        colors: { ...defaultConfig.colors, ...customConfig.colors },
        fonts: { ...defaultConfig.fonts, ...customConfig.fonts },
        layout: { ...defaultConfig.layout, ...customConfig.layout }
    };
}
