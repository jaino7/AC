"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { PlusIcon, BellIcon, MenuIcon } from "./icons";
import { useState, useEffect } from "react";

interface CreatorHeaderProps {
    onMenuClick?: () => void;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function CreatorHeader({ onMenuClick }: CreatorHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // URLから handleを取得
    const creatorHandle = pathname?.split('/')[2] || null;

    // 通知とプロフィールを取得
    useEffect(() => {
        fetchNotifications();
        fetchProfile();
    }, [session]);

    const fetchProfile = async () => {
        try {
            const response = await fetch("/api/creators/profile");
            if (response.ok) {
                const data = await response.json();
                setAvatarUrl(data.profile.avatarUrl || null);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch("/api/creators/notifications?limit=5");
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setNotificationCount(data.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/creators/login");
    };

    const handlePreview = () => {
        // TODO: クリエイターのハンドルを取得してプレビューページに遷移
        // 現在はプレースホルダー
        window.open("/creators/preview", "_blank");
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/creators/notifications/${notificationId}/read`, {
                method: "PUT"
            });
            await fetchNotifications();
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4">
            {/* 左側: メニューボタン + ロゴ */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden"
                    aria-label="メニューを開く"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
                <Link href={creatorHandle ? `/creators/${creatorHandle}/dashboard` : "/creators/dashboard"} className="flex items-center">
                    <img src="/logo.png" alt="Creator Logo" className="h-8 w-auto" />
                </Link>
            </div>

            {/* 右側: アクション */}
            <div className="flex items-center gap-3">
                {/* 作成ボタン */}
                <Link
                    href={creatorHandle ? `/creators/${creatorHandle}/content/new` : "/creators/content/new"}
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">作成</span>
                </Link>

                {/* 通知 */}
                <div className="relative">
                    <DropdownMenu
                        trigger={
                            <button
                                className="relative rounded-lg p-2 hover:bg-neutral-100"
                                aria-label="通知"
                            >
                                <BellIcon className="h-6 w-6" />
                                {notificationCount > 0 && (
                                    <div className="absolute right-1 top-1">
                                        <Badge count={notificationCount} />
                                    </div>
                                )}
                            </button>
                        }
                    >
                        <div className="w-80">
                            <div className="px-4 py-3 font-semibold">通知</div>
                            <DropdownMenuSeparator />
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-neutral-500">
                                    通知はありません
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="py-2">
                                            <p className={`text-sm font-medium ${!notification.isRead ? 'font-bold' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenu>
                </div>

                {/* プロフィール */}
                <DropdownMenu
                    trigger={
                        <button className="rounded-full" aria-label="プロフィールメニュー">
                            <Avatar fallback="C" src={avatarUrl || undefined} />
                        </button>
                    }
                >
                    <DropdownMenuItem>
                        <Link href={creatorHandle ? `/creators/${creatorHandle}/settings` : "/creators/settings"} className="block w-full">
                            設定
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button onClick={handlePreview} className="w-full text-left">
                            サイトをプレビュー
                        </button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <button onClick={handleLogout} className="w-full text-left text-red-600">
                            ログアウト
                        </button>
                    </DropdownMenuItem>
                </DropdownMenu>
            </div>
        </header>
    );
}
