import { useState, useEffect } from "react";
import { getPlatformDomain } from "@/lib/platform-url";

/**
 * カスタムドメインかどうかを判定するフック
 * カスタムドメインの場合、パスから handle プレフィックスを省略できる
 * (middleware が自動付加するため)
 */
export function useIsCustomDomain(): boolean {
    const [isCustomDomain, setIsCustomDomain] = useState(false);

    useEffect(() => {
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "";
        const mainHost = mainDomain
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")[0]
            .split(":")[0];
        const platformDomain = getPlatformDomain();
        const hostname = window.location.hostname;
        setIsCustomDomain(
            hostname !== mainHost
            && hostname !== platformDomain
            && hostname !== `www.${platformDomain}`
            && !hostname.endsWith(`.${platformDomain}`)
            && !hostname.endsWith(".localhost")
            && hostname !== "localhost"
            && hostname !== "127.0.0.1"
        );
    }, []);

    return isCustomDomain;
}

/**
 * カスタムドメインでは handle を省略したパスを返す
 * メインドメインでは /{handle}/path を返す
 */
export function useHandlePath(handle: string) {
    const isCustomDomain = useIsCustomDomain();
    const [isPlatformSubdomain, setIsPlatformSubdomain] = useState(false);

    useEffect(() => {
        const platformDomain = getPlatformDomain();
        const hostname = window.location.hostname;
        setIsPlatformSubdomain(
            (hostname.endsWith(`.${platformDomain}`) &&
                hostname !== `www.${platformDomain}`) ||
            (hostname.endsWith(".localhost") &&
                hostname !== "www.localhost")
        );
    }, []);

    const prefix = isCustomDomain || isPlatformSubdomain ? "" : `/${handle}`;

    return {
        isCustomDomain,
        prefix,
        path: (subpath: string) => `${prefix}${subpath}`,
    };
}
