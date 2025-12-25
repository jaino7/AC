"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const THEMES = [
    { id: "creator-pro", name: "Creator Pro", color: "bg-blue-600", previewUrl: "/creator-pro/account" },
    { id: "neon-pro", name: "Neon Pro", color: "bg-purple-600", previewUrl: "/neon-pro/account" },
    { id: "studio-pro", name: "Studio Pro", color: "bg-gray-900", previewUrl: "/studio-pro/account" },
    { id: "velvet-pro", name: "Velvet Pro", color: "bg-red-800", previewUrl: "/velvet-pro/account" },
    { id: "pure-lite", name: "Pure Lite", color: "bg-white border border-gray-200", previewUrl: "/pure-lite/account" },
    { id: "zine-lite", name: "Zine Lite", color: "bg-yellow-400", previewUrl: "/zine-lite/account" },
];

interface ThemeSelectorProps {
    currentTheme: string;
}

export function ThemeSelector({ currentTheme }: ThemeSelectorProps) {
    const [selectedTheme, setSelectedTheme] = useState(currentTheme);
    const router = useRouter();

    const updateTheme = async (themeId: string) => {
        const res = await fetch("/api/creators/theme", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme: themeId }),
        });

        if (!res.ok) throw new Error("Failed to update theme");
        return themeId;
    };

    const { mutate, isPending } = useMutation({
        mutationFn: updateTheme,
        onSuccess: (themeId) => {
            setSelectedTheme(themeId);
            router.refresh();
        },
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEMES.map((theme) => (
                    <div
                        key={theme.id}
                        className={`
              relative cursor-pointer rounded-xl border-2 p-4 transition-all
              ${selectedTheme === theme.id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 hover:border-gray-300"}
            `}
                        onClick={() => mutate(theme.id)}
                    >
                        <div className={`h-32 w-full rounded-lg mb-3 ${theme.color} flex items-center justify-center`}>
                            <span className="text-xs font-medium bg-black/20 text-white px-2 py-1 rounded">
                                Preview
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{theme.name}</h3>
                            {selectedTheme === theme.id && (
                                <span className="text-blue-600 text-sm font-medium">Active</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Preview Section */}
            <div className="mt-8 border-t pt-8">
                <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
                <div className="border rounded-xl overflow-hidden shadow-sm bg-gray-50">
                    <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="ml-4 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500 flex-1 text-center">
                            your-site.com
                        </div>
                    </div>
                    <div className="aspect-video w-full relative">
                        <iframe
                            src={THEMES.find(t => t.id === selectedTheme)?.previewUrl || "/creator-pro/account"}
                            className="w-full h-full"
                            title="Theme Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
