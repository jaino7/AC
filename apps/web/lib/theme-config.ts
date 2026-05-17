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

const BACKGROUND_IMAGE_THEMES = new Set(["studio-pro", "zine-lite"]);

export function supportsThemeBackgroundImage(theme: string): boolean {
    return BACKGROUND_IMAGE_THEMES.has(theme);
}

interface BrandThemeCSSOptions {
    enableBackgroundImage?: boolean;
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

export function brandThemeOverrideCSS(config: ThemeConfig, options: BrandThemeCSSOptions = {}): string {
    const backgroundImage = options.enableBackgroundImage === false ? "none" : "var(--brand-background-image)";

    return `
    [data-brand-theme] {
      ${themeConfigToCSS(config)}
      background-color: var(--color-background) !important;
      background-image: ${backgroundImage} !important;
      background-size: cover !important;
      background-position: center !important;
      background-attachment: fixed !important;
      color: var(--color-text) !important;
      font-family: var(--font-body) !important;
      --tw-ring-color: color-mix(in srgb, var(--color-accent) 35%, transparent);
    }
    [data-brand-theme] > [data-creator-id] > [class*="min-h-screen"] {
      background: transparent !important;
      color: var(--color-text) !important;
    }
    [data-brand-theme] main,
    [data-brand-theme] header,
    [data-brand-theme] section,
    [data-brand-theme] article,
    [data-brand-theme] input,
    [data-brand-theme] textarea,
    [data-brand-theme] select,
    [data-brand-theme] button {
      font-family: var(--font-body) !important;
    }
    [data-brand-theme] h1,
    [data-brand-theme] h2,
    [data-brand-theme] h3,
    [data-brand-theme] h4 {
      font-family: var(--font-heading) !important;
    }
    [data-brand-theme] header.bg-white,
    [data-brand-theme] footer.bg-white,
    [data-brand-theme] [class*="fixed"][class*="bg-white"] {
      background-color: color-mix(in srgb, var(--color-background) 92%, var(--color-text) 8%) !important;
      color: var(--color-text) !important;
    }
    [data-brand-theme] input,
    [data-brand-theme] textarea,
    [data-brand-theme] select {
      border-radius: var(--brand-button-radius) !important;
    }
    [data-brand-theme] a:hover,
    [data-brand-theme] button:hover {
      border-color: var(--color-accent) !important;
    }
    [data-brand-theme] [class*="text-cyan-"],
    [data-brand-theme] [class*="text-blue-"],
    [data-brand-theme] [class*="text-purple-"],
    [data-brand-theme] [class*="text-pink-"],
    [data-brand-theme] [class*="text-emerald-"],
    [data-brand-theme] [class*="text-green-"],
    [data-brand-theme] [class*="text-amber-"],
    [data-brand-theme] [class*="text-yellow-"] {
      color: var(--color-accent) !important;
    }
    [data-brand-theme] [class*="border-cyan-"],
    [data-brand-theme] [class*="border-blue-"],
    [data-brand-theme] [class*="border-purple-"],
    [data-brand-theme] [class*="border-pink-"],
    [data-brand-theme] [class*="border-emerald-"],
    [data-brand-theme] [class*="border-green-"],
    [data-brand-theme] [class*="border-amber-"],
    [data-brand-theme] [class*="border-yellow-"] {
      border-color: color-mix(in srgb, var(--color-accent) 65%, transparent) !important;
    }
    [data-brand-theme] button,
    [data-brand-theme] a[class*=" px-"],
    [data-brand-theme] a[class*="px-"] {
      border-radius: var(--brand-button-radius) !important;
    }
    [data-brand-theme] :is(button, a)[class*="bg-cyan-"],
    [data-brand-theme] :is(button, a)[class*="bg-blue-"],
    [data-brand-theme] :is(button, a)[class*="bg-purple-"],
    [data-brand-theme] :is(button, a)[class*="bg-pink-"],
    [data-brand-theme] :is(button, a)[class*="bg-emerald-"],
    [data-brand-theme] :is(button, a)[class*="bg-green-"],
    [data-brand-theme] :is(button, a)[class*="bg-amber-"],
    [data-brand-theme] :is(button, a)[class*="bg-yellow-"] {
      background-color: var(--color-primary) !important;
    }
    [data-brand-theme] :is(button, a)[class*="from-cyan-"],
    [data-brand-theme] :is(button, a)[class*="from-blue-"],
    [data-brand-theme] :is(button, a)[class*="from-purple-"],
    [data-brand-theme] :is(button, a)[class*="from-pink-"],
    [data-brand-theme] :is(button, a)[class*="from-emerald-"],
    [data-brand-theme] :is(button, a)[class*="from-green-"],
    [data-brand-theme] :is(button, a)[class*="from-amber-"],
    [data-brand-theme] :is(button, a)[class*="from-yellow-"] {
      --tw-gradient-from: var(--color-primary) var(--tw-gradient-from-position) !important;
      --tw-gradient-to: color-mix(in srgb, var(--color-primary) 0%, transparent) var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    [data-brand-theme] :is(button, a)[class*="to-cyan-"],
    [data-brand-theme] :is(button, a)[class*="to-blue-"],
    [data-brand-theme] :is(button, a)[class*="to-purple-"],
    [data-brand-theme] :is(button, a)[class*="to-pink-"],
    [data-brand-theme] :is(button, a)[class*="to-emerald-"],
    [data-brand-theme] :is(button, a)[class*="to-green-"],
    [data-brand-theme] :is(button, a)[class*="to-amber-"],
    [data-brand-theme] :is(button, a)[class*="to-yellow-"] {
      --tw-gradient-to: var(--color-secondary) var(--tw-gradient-to-position) !important;
    }
    [data-brand-theme] article,
    [data-brand-theme] main a.group[class*="border"],
    [data-brand-theme] section div[class*="border"][class*="p-6"],
    [data-brand-theme] section div[class*="border"][class*="p-4"],
    [data-brand-theme] section div[class*="border"][class*="px-6"] {
      border-radius: var(--brand-card-radius) !important;
    }
    [data-brand-theme] article {
      padding: var(--brand-spacing) !important;
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
