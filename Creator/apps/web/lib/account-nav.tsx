import Link from "next/link";
import { signOut } from "next-auth/react";

export interface AccountNavItem {
    label: string;
    icon: string;
    path: string;
}

export const accountNavItems: AccountNavItem[] = [
    { label: "アカウント情報", icon: "👤", path: "" },
    { label: "プランと支払い", icon: "💳", path: "/billing" },
    { label: "セキュリティ", icon: "🛡", path: "/security" },
    { label: "通知", icon: "🔔", path: "/notifications" },
];

interface AccountNavigationProps {
    baseUrl: string;
    currentPath: string;
    logoutUrl: string;
    theme?: "creator-pro" | "neon-pro" | "pure-lite" | "zine-lite" | "velvet-pro" | "studio-pro";
}

/**
 * アカウントページ共通のサイドバーナビゲーション
 * 各テーマで一貫したナビゲーションを提供
 */
export function getAccountNavLinks(baseUrl: string, currentPath: string) {
    return accountNavItems.map((item) => ({
        ...item,
        href: `${baseUrl}${item.path}`,
        active: currentPath === item.path || (currentPath === "" && item.path === ""),
    }));
}

/**
 * Creator Pro / Neon Pro 用のサイドバーナビゲーションコンポーネント
 */
export function AccountSidebarNav({ baseUrl, currentPath, logoutUrl, theme = "creator-pro" }: AccountNavigationProps) {
    const links = getAccountNavLinks(baseUrl, currentPath);

    const styles = {
        "creator-pro": {
            activeClass: "bg-[#0d1f2f] text-cyan-200",
            inactiveClass: "text-white/70 hover:bg-white/5",
            logoutClass: "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5",
        },
        "neon-pro": {
            activeClass: "bg-[#122048] text-cyan-200",
            inactiveClass: "text-white/70 hover:bg-white/5",
            logoutClass: "mt-10 flex w-full items-center gap-3 rounded-2xl border border-white/15 px-4 py-3 text-sm text-white/70 hover:text-white",
        },
        "pure-lite": {
            activeClass: "border-b-2 border-[#7c5dfa] text-[#1f1f22]",
            inactiveClass: "text-[#8c8c99] hover:text-[#1f1f22]",
            logoutClass: "w-full px-4 py-2 text-left text-sm text-[#4b4b58] hover:bg-[#7c5dfa]/5 hover:text-[#1f1f22]",
        },
        "zine-lite": {
            activeClass: "border-b-2 border-green-400 text-white",
            inactiveClass: "text-white/60 hover:text-white",
            logoutClass: "text-sm text-white/70 hover:text-white",
        },
        "velvet-pro": {
            activeClass: "border-b-2 border-yellow-400 text-white",
            inactiveClass: "text-white/60 hover:text-white",
            logoutClass: "text-sm text-white/60 hover:text-white",
        },
        "studio-pro": {
            activeClass: "border-b-2 border-[#2f6dff] text-white",
            inactiveClass: "text-white/60 hover:text-white",
            logoutClass: "text-white/60 hover:text-white",
        },
    };

    const currentStyles = styles[theme];

    return (
        <nav className="space-y-2">
            {links.map((link) => (
                <Link
                    key={link.label}
                    href={link.href}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${link.active ? currentStyles.activeClass : currentStyles.inactiveClass
                        }`}
                >
                    <span>{link.icon}</span>
                    {link.label}
                </Link>
            ))}
            <button
                onClick={() => signOut({ callbackUrl: logoutUrl })}
                className={currentStyles.logoutClass}
            >
                <span>↩︎</span>
                ログアウト
            </button>
        </nav>
    );
}

/**
 * Pure Lite / Zine Lite / Velvet Pro / Studio Pro 用のタブナビゲーションコンポーネント
 */
export function AccountTabNav({ baseUrl, currentPath }: Omit<AccountNavigationProps, "logoutUrl" | "theme">) {
    const links = getAccountNavLinks(baseUrl, currentPath);

    return (
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
            {links.map((link) => (
                <Link
                    key={link.label}
                    href={link.href}
                    className={`pb-2 ${link.active ? "border-b-2" : ""}`}
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
}
