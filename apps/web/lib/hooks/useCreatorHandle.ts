"use client";

import { usePathname, useSearchParams } from "next/navigation";

const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];

/**
 * クリエイターの handle を解決するフック
 * 優先順: pathname > searchParams > サブドメイン
 */
export function useCreatorHandle(): string | undefined {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const pathSegment = pathname.split('/')[1] || '';

    // パスがテーマ名でない場合、パスセグメントがhandle
    if (pathSegment && !THEME_PREFIXES.includes(pathSegment)) {
        return pathSegment;
    }

    // searchParamsにhandleがある場合
    const handleParam = searchParams.get("handle");
    if (handleParam) {
        return handleParam;
    }

    // サブドメインからhandleを取得
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || '';
        const mainDomainHost = mainDomain.split(':')[0];

        if (
            mainDomainHost &&
            mainDomainHost !== 'localhost' &&
            hostname.endsWith(`.${mainDomainHost}`) &&
            hostname !== mainDomainHost
        ) {
            const subdomain = hostname.slice(0, hostname.length - mainDomainHost.length - 1);
            if (subdomain && !subdomain.includes('.')) {
                return subdomain;
            }
        }
    }

    return undefined;
}
