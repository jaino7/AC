"use client";

import { ThemeCustomizer } from "./ThemeCustomizer";

interface ThemeCustomizerWrapperProps {
    theme: string;
    initialConfig?: any;
}

export function ThemeCustomizerWrapper({ theme, initialConfig }: ThemeCustomizerWrapperProps) {
    const handleSave = async (config: any) => {
        const mergedConfig = {
            ...(initialConfig || {}),
            ...config,
        };

        const response = await fetch("/api/creators/theme", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                theme,
                themeConfig: mergedConfig
            })
        });

        if (!response.ok) {
            throw new Error("Failed to save theme config");
        }
    };

    return (
        <ThemeCustomizer
            theme={theme}
            initialConfig={initialConfig}
            onSave={handleSave}
        />
    );
}
