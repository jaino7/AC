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
    CreditCardIcon,
} from "./icons";

const getNavItems = (handle: string) => [
    { name: "ホーム", href: `/creators/${handle}/dashboard`, icon: HomeIcon },
    { name: "コンテンツ", href: `/creators/${handle}/content`, icon: VideoIcon },
    { name: "分析", href: `/creators/${handle}/analytics`, icon: ChartBarIcon },
    { name: "収益", href: `/creators/${handle}/earnings`, icon: DollarSignIcon },
    { name: "プラン", href: `/creators/${handle}/c-plans`, icon: CreditCardIcon },
];

export function CreatorBottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const handle = (session?.user as any)?.handle;

    if (!handle) return null;

    const navItems = getNavItems(handle);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-neutral-200 bg-white lg:hidden">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                    pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                            isActive
                                ? "text-black"
                                : "text-neutral-400 hover:text-neutral-700"
                        )}
                    >
                        <Icon
                            className={cn(
                                "h-5 w-5",
                                isActive ? "text-black" : "text-neutral-400"
                            )}
                        />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}
