import { useState, useEffect } from "react";

/**
 * カスタムドメインかどうかを判定するフック
 * カスタムドメインの場合、パスから handle プレフィックスを省略できる
 * (middleware が自動付加するため)
 */
export function useIsCustomDomain(): boolean {
    const [isCustomDomain, setIsCustomDomain] = useState(false);

    useEffect(() => {
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "";
        const mainHost = mainDomain.split(":")[0];
        setIsCustomDomain(
            window.location.hostname !== mainHost
            && window.location.hostname !== "localhost"
            && window.location.hostname !== "127.0.0.1"
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
    const prefix = isCustomDomain ? "" : `/${handle}`;

    return {
        isCustomDomain,
        prefix,
        path: (subpath: string) => `${prefix}${subpath}`,
    };
}
