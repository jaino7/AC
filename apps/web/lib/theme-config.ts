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
    background: {
        imageUrl: string;
        pattern: "none" | "dots" | "grid" | "diagonal" | "soft";
    };
    appearance: {
        buttonRadius: string;
        cardRadius: string;
        spacing: string;
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
        background: {
            imageUrl: "",
            pattern: "none"
        },
        appearance: {
            buttonRadius: "999px",
            cardRadius: "16px",
            spacing: "1rem"
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
        background: {
            imageUrl: "",
            pattern: "grid"
        },
        appearance: {
            buttonRadius: "8px",
            cardRadius: "18px",
            spacing: "1rem"
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
        background: {
            imageUrl: "",
            pattern: "none"
        },
        appearance: {
            buttonRadius: "10px",
            cardRadius: "12px",
            spacing: "1rem"
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
        background: {
            imageUrl: "",
            pattern: "soft"
        },
        appearance: {
            buttonRadius: "999px",
            cardRadius: "20px",
            spacing: "1rem"
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
        background: {
            imageUrl: "",
            pattern: "none"
        },
        appearance: {
            buttonRadius: "8px",
            cardRadius: "8px",
            spacing: "0.875rem"
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
        background: {
            imageUrl: "",
            pattern: "dots"
        },
        appearance: {
            buttonRadius: "14px",
            cardRadius: "10px",
            spacing: "1rem"
        },
        layout: {
            maxWidth: "1280px",
            spacing: "1rem"
        }
    }
};

function safeColor(value: string, fallback: string): string {
    return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : fallback;
}

function safeCssText(value: string, fallback: string): string {
    return /^[\w\s"',.-]+$/.test(value) ? value : fallback;
}

function safeCssLength(value: string, fallback: string): string {
    return /^(\d+(\.\d+)?)(px|rem|em|%)$/.test(value) ? value : fallback;
}

function safeImageUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (!/^(https?:\/\/|\/)/.test(trimmed)) return "";
    return trimmed.replace(/["'()\\\n\r]/g, encodeURIComponent);
}

/**
 * テーマ設定をCSS変数に変換
 */
export function themeConfigToCSS(config: ThemeConfig): string {
    const primary = safeColor(config.colors.primary, "#3b82f6");
    const secondary = safeColor(config.colors.secondary, "#1e40af");
    const accent = safeColor(config.colors.accent, "#60a5fa");
    const background = safeColor(config.colors.background, "#ffffff");
    const text = safeColor(config.colors.text, "#1f2937");
    const headingFont = safeCssText(config.fonts.heading, "Inter, sans-serif");
    const bodyFont = safeCssText(config.fonts.body, "Inter, sans-serif");
    const backgroundImageUrl = safeImageUrl(config.background.imageUrl);
    const buttonRadius = safeCssLength(config.appearance.buttonRadius, "999px");
    const cardRadius = safeCssLength(config.appearance.cardRadius, "16px");
    const spacing = safeCssLength(config.appearance.spacing, "1rem");
    const maxWidth = safeCssLength(config.layout.maxWidth, "1280px");
    const layoutSpacing = safeCssLength(config.layout.spacing, "1rem");

    return `
    --color-primary: ${primary};
    --color-secondary: ${secondary};
    --color-accent: ${accent};
    --color-background: ${background};
    --color-text: ${text};
    --font-heading: ${headingFont};
    --font-body: ${bodyFont};
    --brand-background-image: ${backgroundImageUrl ? `url("${backgroundImageUrl}")` : "none"};
    --brand-button-radius: ${buttonRadius};
    --brand-card-radius: ${cardRadius};
    --brand-spacing: ${spacing};
    --layout-max-width: ${maxWidth};
    --layout-spacing: ${layoutSpacing};
  `.trim();
}

export function getBackgroundPatternCSS(pattern: ThemeConfig["background"]["pattern"]): string {
    switch (pattern) {
        case "dots":
            return "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-accent) 28%, transparent) 1px, transparent 0)";
        case "grid":
            return "linear-gradient(color-mix(in srgb, var(--color-accent) 18%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 18%, transparent) 1px, transparent 1px)";
        case "diagonal":
            return "repeating-linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 16%, transparent) 0 1px, transparent 1px 14px)";
        case "soft":
            return "radial-gradient(circle at top left, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 32rem), radial-gradient(circle at bottom right, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 28rem)";
        default:
            return "none";
    }
}

export function brandThemeOverrideCSS(config: ThemeConfig): string {
    const pattern = getBackgroundPatternCSS(config.background.pattern);

    return `
    [data-brand-theme] {
      ${themeConfigToCSS(config)}
      background-color: var(--color-background) !important;
      background-image: var(--brand-background-image), ${pattern} !important;
      background-size: cover, ${config.background.pattern === "grid" ? "28px 28px" : config.background.pattern === "dots" ? "18px 18px" : "auto"} !important;
      background-attachment: fixed, fixed !important;
      color: var(--color-text);
      font-family: var(--font-body);
    }
    [data-brand-theme] main,
    [data-brand-theme] header,
    [data-brand-theme] section,
    [data-brand-theme] article {
      font-family: var(--font-body);
    }
    [data-brand-theme] h1,
    [data-brand-theme] h2,
    [data-brand-theme] h3 {
      font-family: var(--font-heading);
    }
    [data-brand-theme] .text-cyan-400,
    [data-brand-theme] .text-cyan-500,
    [data-brand-theme] .text-pink-500,
    [data-brand-theme] .text-emerald-500,
    [data-brand-theme] .text-amber-600,
    [data-brand-theme] .text-blue-600 {
      color: var(--color-accent) !important;
    }
    [data-brand-theme] button,
    [data-brand-theme] a.bg-cyan-400,
    [data-brand-theme] a.bg-cyan-500,
    [data-brand-theme] a.bg-pink-500,
    [data-brand-theme] a.bg-emerald-500,
    [data-brand-theme] a.bg-amber-500,
    [data-brand-theme] a.bg-blue-600 {
      border-radius: var(--brand-button-radius) !important;
    }
    [data-brand-theme] .bg-cyan-400,
    [data-brand-theme] .bg-cyan-500,
    [data-brand-theme] .bg-pink-500,
    [data-brand-theme] .bg-emerald-500,
    [data-brand-theme] .bg-amber-500,
    [data-brand-theme] .bg-blue-600 {
      background-color: var(--color-primary) !important;
    }
    [data-brand-theme] article,
    [data-brand-theme] main a.group[class*="border"],
    [data-brand-theme] section div[class*="border"][class*="p-6"] {
      border-radius: var(--brand-card-radius);
    }
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
        background: { ...defaultConfig.background, ...customConfig.background },
        appearance: { ...defaultConfig.appearance, ...customConfig.appearance },
        layout: { ...defaultConfig.layout, ...customConfig.layout }
    };
}
