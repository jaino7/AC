"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    HomeIcon,
    VideoIcon,
    ChartBarIcon,
    DollarSignIcon,
    SettingsIcon,
    CreditCardIcon,
    PaletteIcon,
    FeedbackIcon,
    InboxIcon,
} from "./icons";

const getNavigation = (handle: string) => [
    { name: "ダッシュボード", href: `/creators/${handle}/dashboard`, icon: HomeIcon },
    { name: "コンテンツ管理", href: `/creators/${handle}/content`, icon: VideoIcon },
    { name: "アナリティクス", href: `/creators/${handle}/analytics`, icon: ChartBarIcon },
    { name: "プラン設定", href: `/creators/${handle}/c-plans`, icon: CreditCardIcon },
    { name: "収益", href: `/creators/${handle}/earnings`, icon: DollarSignIcon },
    { name: "テーマ", href: `/creators/${handle}/settings/theme`, icon: PaletteIcon },
    { name: "お問い合わせ", href: `/creators/${handle}/inquiries`, icon: InboxIcon },
    { name: "設定", href: `/creators/${handle}/settings`, icon: SettingsIcon },
    { name: "フィードバック", href: `/creators/${handle}/feedback`, icon: FeedbackIcon },
];

export function CreatorSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const pathHandle = pathname?.split("/")[2];
    const handle = (session?.user as any)?.handle || pathHandle;

    if (!handle) {
        return null;
    }

    const navigation = getNavigation(handle);

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#212121] pt-16">
            <nav className="space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
