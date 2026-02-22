"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { changePassword, updateProfile } from "@/lib/api";
import { useCredits, useInvalidateCredits } from "@/components/hooks/useCredits";
import ChargeModal from "@/components/credits/ChargeModal";
import { TrustRankDisplay } from "@/components/credits/TrustRankDisplay";

type CreditHistory = {
    id: string;
    type: string;
    amount: number;
    balance: number;
    description: string;
    createdAt: string;
};

type ChargeRequest = {
    id: string;
    amount: number;
    status: string;
    identifierCode: string;
    expiresAt: string;
    createdAt: string;
};

interface SimpleAccountPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
    currentPage?: "account" | "billing" | "security" | "notifications" | "credits";
}

export function SimpleAccountPage({
    handle: propHandle,
    displayName,
    logoUrl,
    currentPage = "account"
}: SimpleAccountPageProps) {
    const searchParams = useSearchParams();
    const handle = propHandle || searchParams.get("handle");
    const { data: session, update: updateSession, status } = useSession();

    // クレジット情報を取得
    const { data: creditsData, isLoading: creditsLoading, error: creditsError } = useCredits(handle || undefined);
    const invalidateCredits = useInvalidateCredits();

    const [chargeRequests, setChargeRequests] = useState<ChargeRequest[]>([]);
    const [showChargeModal, setShowChargeModal] = useState(false);

    // プラン関連
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

    useEffect(() => {
        if (currentPage === "billing" && status === "authenticated") {
            const fetchSubscriptions = async () => {
                setLoadingSubscriptions(true);
                try {
                    const url = handle ? `/api/fans/subscribe?handle=${handle}` : "/api/fans/subscribe";
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        setSubscriptions(data.subscriptions || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch subscriptions:", error);
                } finally {
                    setLoadingSubscriptions(false);
                }
            };
            fetchSubscriptions();
        }
    }, [currentPage, handle, status]);

    useEffect(() => {
        if (currentPage === "credits" && status === "authenticated") {
            const fetchChargeRequests = async () => {
                try {
                    const url = handle ? `/api/fans/credits/charge-requests?handle=${handle}` : "/api/fans/credits/charge-requests";
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        setChargeRequests(data.chargeRequests || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch charge requests:", error);
                    setChargeRequests([]);
                }
            };
            fetchChargeRequests();
        }
    }, [currentPage, handle, status]);

    // セッションからユーザー情報を取得
    const userEmail = session?.user?.email || "";
    const userName = session?.user?.name || displayName;

    // 動的なリンク生成
    const baseUrl = handle ? `/${handle}/account` : "/account";
    const contentUrl = handle ? `/${handle}/content` : "/";
    const logoutUrl = handle ? `/${handle}/login` : "/";

    const [imagePreview, setImagePreview] = useState<string | null>(logoUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 表示名の状態
    const [editDisplayName, setEditDisplayName] = useState(userName);

    // セッションロード完了後に初期値を同期

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            if (session.user.name) {
                setEditDisplayName(session.user.name);
            }
            if (session.user.image && !selectedFile) {
                // 未選択時のみ、セッションの画像をプレビューに適用
                setImagePreview(session.user.image);
            }
        }
    }, [status, session?.user]);

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // パスワード変更モーダルの状態
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // パスワード表示状態
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // セッションがロード中の場合はローディング表示
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-white text-gray-900">
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-gray-500">読み込み中...</p>
                </div>
            </div>
        );
    }

    // 未認証の場合はログインページへリダイレクト
    if (status === "unauthenticated") {
        if (typeof window !== "undefined") {
            const loginUrl = handle ? `/${handle}/login` : "/creators/login";
            window.location.href = loginUrl;
        }
        return (
            <div className="min-h-screen bg-white text-gray-900">
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-gray-500">ログインページへ移動しています...</p>
                </div>
            </div>
        );
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 表示名の保存
    const handleSaveDisplayName = async () => {
        const userId = (session?.user as any)?.id;
        if (!userId) {
            setSaveMessage("ログインが必要です");
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);
        try {
            let newAvatarUrl = session?.user?.image;

            // 画像のアップロード
            if (selectedFile) {
                const formData = new FormData();
                formData.append("avatar", selectedFile);
                const res = await fetch("/api/user/avatar", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.avatarUrl) {
                        newAvatarUrl = data.avatarUrl;
                    }
                } else {
                    const error = await res.json();
                    throw new Error(error.error || "画像のアップロードに失敗しました");
                }
            }

            await updateProfile({
                userId,
                name: editDisplayName,
                displayName: editDisplayName
            });
            // セッションを更新して表示名を反映
            await updateSession({ name: editDisplayName, image: newAvatarUrl });
            setSelectedFile(null); // ファイル状態をリセット
            setSaveMessage("保存しました");
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            setSaveMessage((error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    // パスワード変更
    const handleChangePassword = async () => {
        const userId = (session?.user as any)?.id;
        if (!userId) {
            setPasswordError("ログインが必要です");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("新しいパスワードが一致しません");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("パスワードは8文字以上で入力してください");
            return;
        }

        setIsChangingPassword(true);
        setPasswordError(null);
        try {
            await changePassword({
                userId,
                currentPassword,
                newPassword,
                confirmPassword
            });
            setShowPasswordModal(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            alert("パスワードを変更しました");
        } catch (error) {
            setPasswordError((error as Error).message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const navItems = [
        { label: "アカウント情報", path: "", key: "account" },
        { label: "プラン", path: "/billing", key: "billing" },
        { label: "クレジット", path: "/credits", key: "credits" },
        { label: "セキュリティ", path: "/security", key: "security" },
        { label: "通知", path: "/notifications", key: "notifications" },
    ];

    const getStatusLabel = (s: string) => {
        switch (s) {
            case "PENDING": return { text: "振込待ち", color: "bg-yellow-100 text-yellow-800" };
            case "TRANSFERRED": return { text: "確認中", color: "bg-blue-100 text-blue-800" };
            case "APPROVED": return { text: "完了", color: "bg-green-100 text-green-800" };
            case "REJECTED": return { text: "却下", color: "bg-red-100 text-red-800" };
            case "EXPIRED": return { text: "期限切れ", color: "bg-gray-100 text-gray-800" };
            default: return { text: s, color: "bg-gray-100 text-gray-800" };
        }
    };

    const getHistoryTypeLabel = (type: string) => {
        switch (type) {
            case "CHARGE": return { text: "チャージ", color: "text-blue-600" };
            case "PURCHASE": return { text: "購入", color: "text-orange-600" };
            case "SUBSCRIBE": return { text: "購読", color: "text-purple-600" };
            case "REFUND": return { text: "返金", color: "text-green-600" };
            default: return { text: type, color: "text-gray-600" };
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                    <Link href={contentUrl} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium">戻る</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: logoutUrl })}
                        className="text-sm text-gray-500 hover:text-gray-900 transition"
                    >
                        ログアウト
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto w-full max-w-6xl px-4 py-10">
                <h1 className="text-2xl font-bold text-gray-900">アカウント設定</h1>

                {/* クレジット表示 - 全ページで表示 */}
                <div className="mt-6 rounded-lg border border-gray-200 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">保有クレジット</p>
                            <div className="mt-1 flex items-baseline gap-2">
                                {creditsLoading ? (
                                    <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
                                ) : creditsError ? (
                                    <p className="text-sm text-red-600">読み込みエラー</p>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {(creditsData?.credits || 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">クレジット</p>
                                    </>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">1クレジット = ¥1</p>
                        </div>
                        <Link
                            href={`${baseUrl}/credits`}
                            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            チャージ
                        </Link>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mt-6 border-b border-gray-200">
                    <nav className="flex gap-6 overflow-x-auto pb-[1px]">
                        {navItems.map((item) => (
                            <Link
                                key={item.key}
                                href={`${baseUrl}${item.path}`}
                                className={`whitespace-nowrap pb-3 text-sm font-medium transition ${currentPage === item.key
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Account Info Content */}
                {currentPage === "account" && (
                    <div className="mt-8 space-y-8">
                        {/* Profile Image */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-2xl font-semibold text-gray-500">
                                            {userName?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">{userName}</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-1 text-sm text-blue-600 hover:underline"
                                >
                                    画像を変更
                                </button>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">表示名</label>
                                <input
                                    type="text"
                                    value={editDisplayName}
                                    onChange={(e) => setEditDisplayName(e.target.value)}
                                    placeholder="表示名"
                                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSaveDisplayName}
                                    disabled={isSaving}
                                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "保存中..." : "保存"}
                                </button>
                                {saveMessage && (
                                    <span className={`text-sm ${saveMessage === "保存しました" ? "text-green-600" : "text-red-600"}`}>
                                        {saveMessage}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing Content */}
                {currentPage === "billing" && (
                    <div className="mt-8 space-y-6">
                        {loadingSubscriptions ? (
                            <div className="rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
                                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                                現在加入しているプランはありません。
                            </div>
                        ) : (
                            subscriptions.map((sub, index) => (
                                <div key={sub.id || index} className="rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                現在のプラン {handle ? "" : `(${sub.plan.creator.displayName || sub.plan.creator.handle})`}
                                            </p>
                                            <p className="mt-1 text-xl font-semibold text-gray-900">{sub.plan.name}</p>
                                            <p className="mt-1 text-sm text-gray-500">月額 ¥{sub.plan.price}</p>
                                        </div>
                                        {/* TODO: プラン変更先リンクなどは適宜調整 */}
                                        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
                                            プランを変更
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Credits Content */}
                {currentPage === "credits" && (
                    <div className="mt-8 space-y-6">
                        {/* Trust Rank Display */}
                        <div className="rounded-lg border border-gray-200 p-6 bg-white">
                            <TrustRankDisplay
                                tier={creditsData?.tier || 0}
                                trustScore={creditsData?.trustScore || 0}
                                variant="studio-pro"
                            />
                        </div>

                        {/* Charge Requests */}
                        {chargeRequests && chargeRequests.length > 0 && (
                            <div className="rounded-lg border border-gray-200 p-6 bg-white">
                                <h2 className="text-lg font-semibold mb-4">チャージ申請</h2>
                                <div className="space-y-3">
                                    {chargeRequests.map((req) => {
                                        const status = getStatusLabel(req.status);
                                        return (
                                            <div key={req.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">¥{req.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 mt-1">識別コード: {req.identifierCode}</p>
                                                    <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString("ja-JP")}</p>
                                                </div>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Credit History */}
                        <div className="rounded-lg border border-gray-200 p-6 bg-white">
                            <h2 className="text-lg font-semibold mb-4">利用履歴</h2>
                            {!creditsData?.history || creditsData.history.length === 0 ? (
                                <p className="text-gray-500">履歴がありません</p>
                            ) : (
                                <div className="space-y-3">
                                    {creditsData.history.map((item) => {
                                        const typeLabel = getHistoryTypeLabel(item.type);
                                        return (
                                            <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.description}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className={`text-xs font-medium ${typeLabel.color}`}>{typeLabel.text}</span>
                                                        <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString("ja-JP")}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${item.amount > 0 ? "text-blue-600" : "text-gray-900"}`}>
                                                        {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}円
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">残高: ¥{item.balance.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Content */}
                {currentPage === "security" && (
                    <div className="mt-8 space-y-6">
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">メールアドレス</p>
                                    <p className="mt-1 font-medium">{userEmail || "未設定"}</p>
                                </div>
                                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
                                    変更
                                </button>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">パスワード</p>
                                    <p className="mt-1 font-medium">••••••••</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    変更
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Content */}
                {currentPage === "notifications" && (
                    <div className="mt-8 space-y-6">
                        <p className="text-gray-600">通知を受け取る項目を選択してください。</p>
                        {[
                            { key: "newContent", label: "新作の作品", desc: "新しい作品が公開されたときに通知を受け取ります。" },
                            { key: "updates", label: "機能とアップデート", desc: "新機能やアップデート情報を受け取ります。" },
                            { key: "campaigns", label: "キャンペーン", desc: "お得なキャンペーン情報を受け取ります。" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between rounded-lg border border-gray-200 p-6">
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                                <button className="relative h-6 w-11 rounded-full bg-blue-600 transition">
                                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* パスワード変更モーダル */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900">パスワードの変更</h2>
                        <p className="mt-1 text-sm text-gray-500">セキュリティのため、現在のパスワードを入力してください。</p>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">現在のパスワード</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showCurrentPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">新しいパスワード</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="8文字以上"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showNewPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">新しいパスワード（確認）</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {passwordError && (
                                <p className="text-sm text-red-600">{passwordError}</p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setPasswordError(null);
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isChangingPassword ? "変更中..." : "変更"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showChargeModal && (
                <ChargeModal
                    handle={handle || undefined}
                    tier={creditsData?.tier || 0}
                    variant="studio-pro" // ライト・プロベースでの共通デザインにするため固定または適宜調整
                    onClose={() => {
                        setShowChargeModal(false);
                        invalidateCredits(handle || undefined);
                    }}
                    onSuccess={() => {
                        invalidateCredits(handle || undefined);
                    }}
                />
            )}
        </div>
    );
}

// 各ページ用のエクスポート
export function SimpleAccountBillingPage(props: Omit<SimpleAccountPageProps, "currentPage">) {
    return <SimpleAccountPage {...props} currentPage="billing" />;
}

export function SimpleAccountCreditsPage(props: Omit<SimpleAccountPageProps, "currentPage">) {
    return <SimpleAccountPage {...props} currentPage="credits" />;
}

export function SimpleAccountSecurityPage(props: Omit<SimpleAccountPageProps, "currentPage">) {
    return <SimpleAccountPage {...props} currentPage="security" />;
}

export function SimpleAccountNotificationsPage(props: Omit<SimpleAccountPageProps, "currentPage">) {
    return <SimpleAccountPage {...props} currentPage="notifications" />;
}
