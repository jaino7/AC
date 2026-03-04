"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandAssetsSettings from "@/components/BrandAssetsSettings";

type Tab = "profile" | "brand" | "plans" | "notifications" | "domain";

const tabs = [
    { id: "profile" as Tab, icon: "👤", label: "プロフィール" },
    { id: "brand" as Tab, icon: "🎨", label: "ブランド" },
    { id: "plans" as Tab, icon: "💳", label: "プラン" },
    { id: "notifications" as Tab, icon: "🔔", label: "通知" },
    { id: "domain" as Tab, icon: "🌐", label: "ドメイン設定" }
];

interface DomainData {
    id: string;
    domain: string;
    status: string;
    sslValidationRecords?: Array<{
        txt_name: string;
        txt_value: string;
    }>;
    lastError?: string;
}

interface CreatorProfile {
    id: string;
    hasAccess: boolean;
    planType?: string;
}

interface Subscription {
    id?: string;
    status: string;
    plan: {
        type: string;
        name: string;
        monthlyPrice: number;
        yearlyPrice: number;
        feeRate: number;
    };
    isYearly: boolean;
    nextBillingDate?: string | null;
    endDate?: string | null;
    billingBalance: number;
}

interface CreatorPlan {
    id: string;
    type: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    feeRate: number;
    features: string[] | null;
}

interface VirtualAccount {
    accountNumber: string;
    accountName: string;
    branchCode: string | null;
    branchName: string | null;
}

export default function SettingsContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [initialLogoUrl, setInitialLogoUrl] = useState<string | null>(null);
    const [initialFaviconUrl, setInitialFaviconUrl] = useState<string | null>(null);
    const [initialShowNameInHeader, setInitialShowNameInHeader] = useState<boolean>(true);
    const [headerUrl, setHeaderUrl] = useState<string | null>(null);
    const [twitterUrl, setTwitterUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [tiktokUrl, setTiktokUrl] = useState("");
    const [discordUrl, setDiscordUrl] = useState("");
    const [otherUrl, setOtherUrl] = useState("");
    const [otherUrlName, setOtherUrlName] = useState("");
    const [maintenanceNotification, setMaintenanceNotification] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingHeader, setIsUploadingHeader] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Domain settings state
    const [domainData, setDomainData] = useState<DomainData | null>(null);
    const [domainInput, setDomainInput] = useState("");
    const [domainLoading, setDomainLoading] = useState(false);
    const [domainVerifying, setDomainVerifying] = useState(false);
    const [domainError, setDomainError] = useState<string | null>(null);
    const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
    const [domainSearchQuery, setDomainSearchQuery] = useState("");

    // Subscription state
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmingPlan, setConfirmingPlan] = useState<string | null>(null);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalInfo, setPaymentModalInfo] = useState<{
        amount: number;
        planName: string;
        isYearly: boolean;
        virtualAccount: VirtualAccount;
    } | null>(null);

    // Plans state
    const [allPlans, setAllPlans] = useState<CreatorPlan[]>([]);
    const [selectingPlan, setSelectingPlan] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    // Identity verification state
    const [verificationStatus, setVerificationStatus] = useState<string>("NONE");
    const [verificationRejectReason, setVerificationRejectReason] = useState<string | null>(null);

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/creators/profile");
                if (response.ok) {
                    const data = await response.json();
                    setDisplayName(data.profile.displayName || "");
                    setBio(data.profile.bio || "");
                    setAvatarUrl(data.profile.avatarUrl || null);
                    setInitialLogoUrl(data.profile.logoUrl || null);
                    setInitialFaviconUrl(data.profile.faviconUrl || null);
                    setInitialShowNameInHeader((data.profile.themeConfig as any)?.showNameInHeader ?? true);
                    setHeaderUrl(data.profile.headerUrl || null);
                    setTwitterUrl(data.profile.twitterUrl || "");
                    setInstagramUrl(data.profile.instagramUrl || "");
                    setTiktokUrl(data.profile.tiktokUrl || "");
                    setDiscordUrl(data.profile.discordUrl || "");
                    setOtherUrl(data.profile.otherUrl || "");
                    setOtherUrlName(data.profile.otherUrlName || "");

                    // Set creator profile for domain access check
                    setCreatorProfile({
                        id: data.profile.id,
                        hasAccess: data.profile.hasAccess || false,
                        planType: data.profile.planType,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchVerificationStatus = async () => {
            try {
                const response = await fetch("/api/creators/identity-verification/status");
                if (response.ok) {
                    const data = await response.json();
                    setVerificationStatus(data.status);
                    setVerificationRejectReason(data.rejectReason || null);
                }
            } catch (error) {
                console.error("Failed to fetch verification status:", error);
            }
        };

        fetchProfile();
        fetchVerificationStatus();
    }, []);

    // Fetch domain data when domain tab is active
    useEffect(() => {
        if (activeTab === "domain") {
            loadDomain();
        }
    }, [activeTab]);

    // Fetch subscription and plans data when plans tab is active
    useEffect(() => {
        if (activeTab === "plans") {
            fetchSubscription();
            fetchPlans();
        }
    }, [activeTab]);

    const fetchPlans = async () => {
        try {
            const response = await fetch("/api/creators/plans");
            if (response.ok) {
                const data = await response.json();
                setAllPlans(data.plans);
            }
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        }
    };

    const fetchSubscription = async () => {
        setSubscriptionLoading(true);
        try {
            const response = await fetch("/api/creators/subscription");
            if (response.ok) {
                const data = await response.json();
                console.log('Subscription data received:', data);
                console.log('Virtual Account:', data.virtualAccount);
                setSubscription(data.subscription);
                setVirtualAccount(data.virtualAccount);
            }
        } catch (error) {
            console.error("Failed to fetch subscription:", error);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const response = await fetch("/api/creators/subscription/cancel", {
                method: "PATCH",
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                setShowCancelModal(false);
                // Refresh subscription data
                await fetchSubscription();
            } else {
                const error = await response.json();
                alert(error.error || "キャンセルに失敗しました");
            }
        } catch (error) {
            console.error("Failed to cancel subscription:", error);
            alert("キャンセルに失敗しました");
        } finally {
            setIsCancelling(false);
        }
    };

    const executeSelectPlan = async (planType: string) => {
        setSelectingPlan(planType);
        try {
            const response = await fetch("/api/payments/creator-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planType,
                    isYearly: billingCycle === "yearly",
                }),
            });

            if (response.ok) {
                const data = await response.json();
                await fetchSubscription();
                await fetchPlans();
                setShowConfirmModal(false);
                setConfirmingPlan(null);

                if (data.virtualAccount) {
                    setPaymentModalInfo({
                        amount: data.amount,
                        planName: data.planType,
                        isYearly: data.isYearly,
                        virtualAccount: data.virtualAccount,
                    });
                    setShowPaymentModal(true);
                }
            } else {
                const errorData = await response.json();
                if (errorData.error && typeof errorData.error === 'string' && errorData.error.startsWith("INSUFFICIENT_BALANCE:")) {
                    const parts = errorData.error.split(":");
                    const required = parseInt(parts[1], 10);
                    const current = parseInt(parts[2], 10);
                    alert(`変更に必要な残高が不足しています。\n\n日割り計算後の差額請求額: ¥${required.toLocaleString()}\n現在のプリペイド残高: ¥${current.toLocaleString()}\n\n不足分（¥${(required - current).toLocaleString()}）を設定画面下部の「プリペイド残高」の専用口座へお振り込みください。`);
                } else if (errorData.error === "すでに同じプランを選択しています") {
                    alert(errorData.error);
                } else {
                    alert(errorData.error || "プランの選択に失敗しました");
                }
            }
        } catch (error) {
            console.error("Failed to select plan:", error);
            alert("プランの選択に失敗しました");
        } finally {
            setSelectingPlan(null);
        }
    };

    const handleSelectPlan = (planType: string) => {
        // FREEへの切り替えはキャンセル扱い
        if (planType === "FREE") {
            setShowCancelModal(true);
            return;
        }

        setConfirmingPlan(planType);
        setShowConfirmModal(true);
    };

    const loadDomain = async () => {
        try {
            const response = await fetch("/api/domains/me");
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setDomainData(data);
                    setDomainInput(data.domain);
                }
            }
        } catch (error) {
            console.error("Failed to load domain:", error);
        }
    };

    const handleSaveDomain = async () => {
        if (!domainInput.trim()) {
            setDomainError("ドメイン名を入力してください");
            return;
        }

        setDomainLoading(true);
        setDomainError(null);

        try {
            const response = await fetch("/api/domains", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: domainInput.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "ドメインの登録に失敗しました");
            }

            const data = await response.json();
            setDomainData(data);
            alert("ドメインを登録しました。DNS設定を行ってから検証ボタンを押してください。");
        } catch (err: any) {
            setDomainError(err.message);
        } finally {
            setDomainLoading(false);
        }
    };

    const handleVerifyDomain = async () => {
        if (!domainData) return;

        setDomainVerifying(true);
        setDomainError(null);

        try {
            const response = await fetch(`/api/domains/${domainData.id}/verify`, {
                method: "POST",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "検証に失敗しました");
            }

            const data = await response.json();
            setDomainData(data);

            if (data.status === "ACTIVE") {
                alert("ドメインの検証が完了しました！");
            } else if (data.status === "VERIFYING") {
                alert("検証中です。DNS設定が反映されるまで時間がかかる場合があります。");
            } else if (data.status === "FAILED") {
                alert(`検証に失敗しました: ${data.lastError || "不明なエラー"}`);
            }
        } catch (err: any) {
            setDomainError(err.message);
        } finally {
            setDomainVerifying(false);
        }
    };

    const handleDeleteDomain = async () => {
        if (!domainData) return;

        if (!confirm("ドメインを削除してもよろしいですか？")) {
            return;
        }

        setDomainLoading(true);

        try {
            const response = await fetch(`/api/domains/${domainData.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "削除に失敗しました");
            }

            setDomainData(null);
            setDomainInput("");
            alert("ドメインを削除しました");
        } catch (err: any) {
            setDomainError(err.message);
        } finally {
            setDomainLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-700",
            VERIFYING: "bg-blue-100 text-blue-700",
            ACTIVE: "bg-green-100 text-green-700",
            FAILED: "bg-red-100 text-red-700",
            DISCONNECTED: "bg-gray-100 text-gray-700",
        };

        const labels: Record<string, string> = {
            PENDING: "検証待ち",
            VERIFYING: "検証中",
            ACTIVE: "有効",
            FAILED: "検証失敗",
            DISCONNECTED: "切断済み",
        };

        return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status] || styles.PENDING}`}>
                {labels[status] || status}
            </span>
        );
    };

    const handleSaveProfile = async () => {
        setMessage(null);
        setIsSaving(true);
        try {
            const response = await fetch("/api/creators/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    displayName,
                    bio,
                    twitterUrl,
                    instagramUrl,
                    tiktokUrl,
                    discordUrl,
                    otherUrl,
                    otherUrlName,
                    headerUrl
                }),
            });

            if (response.ok) {
                setMessage("プロフィールを更新しました。");
            } else {
                const error = await response.json();
                setMessage(error.error || "更新に失敗しました。");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            setMessage("更新に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setMessage(null);
        setIsUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const response = await fetch("/api/creators/avatar", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setAvatarUrl(data.avatarUrl);
                setMessage("プロフィール画像を更新しました。");
            } else {
                const error = await response.json();
                setMessage(error.error || "アップロードに失敗しました。");
            }
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            setMessage("アップロードに失敗しました。");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleHeaderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setMessage(null);
        setIsUploadingHeader(true);

        try {
            const formData = new FormData();
            formData.append("headerImage", file);

            const response = await fetch("/api/creators/header-image", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setHeaderUrl(data.headerUrl);
                setMessage("ヘッダー画像を更新しました。");
            } else {
                const error = await response.json();
                setMessage(error.error || "アップロードに失敗しました。");
            }
        } catch (error) {
            console.error("Failed to upload header image:", error);
            setMessage("アップロードに失敗しました。");
        } finally {
            setIsUploadingHeader(false);
        }
    };



    return (
        <main className="min-h-screen bg-neutral-50 px-0 py-6 md:px-6 md:py-10 text-black lg:px-12">
            <div className="mx-auto max-w-7xl">
                {/* ページヘッダー */}
                <header className="mb-6 md:mb-8 px-4 md:px-0">
                    <h1 className="text-3xl font-semibold">設定</h1>
                </header>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* 左サイドタブナビゲーション */}
                    <aside className="w-full md:w-64 flex-shrink-0 px-4 md:px-0">
                        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0 scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex md:w-full flex-shrink-0 items-center gap-2 md:gap-3 rounded-2xl px-4 py-2 md:py-3 text-left text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-white text-neutral-700 hover:bg-neutral-100"
                                        }`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* メインコンテンツエリア */}
                    <div className="flex-1 space-y-6">
                        {activeTab === "profile" && (
                            <>
                                {/* Identity Verification Status */}
                                {verificationStatus === "NONE" && (
                                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">⚠️</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-yellow-900">
                                                    本人確認が完了していません
                                                </p>
                                                <p className="mt-1 text-sm text-yellow-800">
                                                    アダルトコンテンツの投稿には本人確認が必要です。
                                                </p>
                                                <a
                                                    href="/creators/verify-identity"
                                                    className="mt-3 inline-block rounded-2xl bg-yellow-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-700"
                                                >
                                                    本人確認を申請する
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === "PENDING" && (
                                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">🕐</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-blue-900">
                                                    本人確認書類を審査中です
                                                </p>
                                                <p className="mt-1 text-sm text-blue-800">
                                                    審査は通常1〜3営業日で完了します。しばらくお待ちください。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === "APPROVED" && (
                                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">✅</span>
                                            <p className="font-semibold text-green-900">
                                                本人確認済み
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === "REJECTED" && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">❌</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-red-900">
                                                    本人確認が却下されました
                                                </p>
                                                {verificationRejectReason && (
                                                    <p className="mt-1 text-sm text-red-800">
                                                        却下理由: {verificationRejectReason}
                                                    </p>
                                                )}
                                                <a
                                                    href="/creators/verify-identity"
                                                    className="mt-3 inline-block rounded-2xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                                >
                                                    再申請する
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Basic Info */}
                                <section className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                    <h2 className="mb-6 text-xl font-semibold">基本情報</h2>

                                    <div className="space-y-6">
                                        {/* Profile Image */}
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                プロフィール画像
                                            </label>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                                {/* Avatar Preview */}
                                                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-black/10 bg-neutral-100">
                                                    {avatarUrl ? (
                                                        <img
                                                            src={avatarUrl}
                                                            alt="Profile"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-400">
                                                            👤
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Upload Button */}
                                                <div>
                                                    <label
                                                        htmlFor="avatar-upload"
                                                        className="inline-block cursor-pointer rounded-2xl border border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                                                    >
                                                        {isUploadingAvatar ? "アップロード中..." : "画像を選択"}
                                                    </label>
                                                    <input
                                                        id="avatar-upload"
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        onChange={handleAvatarUpload}
                                                        disabled={isUploadingAvatar}
                                                        className="hidden"
                                                    />
                                                    <p className="mt-2 text-xs text-neutral-500">
                                                        推奨: 正方形の画像、最大5MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Header Image */}
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                ヘッダー画像
                                            </label>
                                            <div className="flex flex-col gap-4">
                                                {/* Header Preview */}
                                                <div className="relative h-40 w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-black/10 bg-neutral-100">
                                                    {headerUrl ? (
                                                        <img
                                                            src={headerUrl}
                                                            alt="Header"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-400">
                                                            🖼️
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Upload Button */}
                                                <div>
                                                    <label
                                                        htmlFor="header-upload"
                                                        className="inline-block cursor-pointer rounded-2xl border border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                                                    >
                                                        {isUploadingHeader ? "アップロード中..." : "画像を選択"}
                                                    </label>
                                                    <input
                                                        id="header-upload"
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        onChange={handleHeaderUpload}
                                                        disabled={isUploadingHeader}
                                                        className="hidden"
                                                    />
                                                    <p className="mt-2 text-xs text-neutral-500">
                                                        推奨: 長方形の画像（1200x400など）、最大10MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="displayName" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                表示名
                                            </label>
                                            <input
                                                id="displayName"
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                自己紹介
                                            </label>
                                            <textarea
                                                id="bio"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={5}
                                                className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Social Media Section */}
                                    <div className="mt-8 border-t border-neutral-200 pt-6">
                                        <h3 className="mb-4 text-lg font-semibold">ソーシャルメディア</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="twitterUrl" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                    <span className="mr-2">𝕏</span>X (Twitter)
                                                </label>
                                                <input
                                                    id="twitterUrl"
                                                    type="url"
                                                    value={twitterUrl}
                                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                                    placeholder="https://twitter.com/username"
                                                    className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="instagramUrl" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                    📷 Instagram
                                                </label>
                                                <input
                                                    id="instagramUrl"
                                                    type="url"
                                                    value={instagramUrl}
                                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                                    placeholder="https://instagram.com/username"
                                                    className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="tiktokUrl" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                    🎵 TikTok
                                                </label>
                                                <input
                                                    id="tiktokUrl"
                                                    type="url"
                                                    value={tiktokUrl}
                                                    onChange={(e) => setTiktokUrl(e.target.value)}
                                                    placeholder="https://tiktok.com/@username"
                                                    className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="discordUrl" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                    💬 Discord
                                                </label>
                                                <input
                                                    id="discordUrl"
                                                    type="url"
                                                    value={discordUrl}
                                                    onChange={(e) => setDiscordUrl(e.target.value)}
                                                    placeholder="https://discord.gg/invite"
                                                    className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <div className="mb-2 flex items-center gap-2 block text-sm font-semibold text-neutral-700">
                                                    <label htmlFor="otherUrlName" className="cursor-pointer">
                                                        🔗 その他 (表示名)
                                                    </label>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <input
                                                        id="otherUrlName"
                                                        type="text"
                                                        value={otherUrlName}
                                                        onChange={(e) => setOtherUrlName(e.target.value)}
                                                        placeholder="リンク名 (例: YouTube)"
                                                        className="w-full sm:w-1/3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                                    />
                                                    <input
                                                        id="otherUrl"
                                                        type="url"
                                                        value={otherUrl}
                                                        onChange={(e) => setOtherUrl(e.target.value)}
                                                        placeholder="https://example.com"
                                                        className="w-full sm:w-2/3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {message && (
                                        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${message.includes("失敗")
                                            ? "border-red-200 bg-red-50 text-red-600"
                                            : "border-green-200 bg-green-50 text-green-600"
                                            }`}>
                                            {message}
                                        </p>
                                    )}

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving || isLoading}
                                            className="rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isSaving ? "保存中..." : "変更する"}
                                        </button>
                                    </div>
                                </section>
                            </>
                        )}


                        {activeTab === "brand" && (
                            isLoading ? (
                                <section className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-neutral-400">読み込み中...</div>
                                    </div>
                                </section>
                            ) : creatorProfile?.id ? (
                                <BrandAssetsSettings
                                    creatorId={creatorProfile.id}
                                    initialLogoUrl={initialLogoUrl}
                                    initialFaviconUrl={initialFaviconUrl}
                                    initialShowNameInHeader={initialShowNameInHeader}
                                    showAvatar={false}
                                />
                            ) : (
                                <section className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-neutral-400">プロフィール情報を取得できませんでした。ページを再読み込みしてください。</div>
                                    </div>
                                </section>
                            )
                        )}

                        {activeTab === "plans" && (
                            <section className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <h2 className="text-xl font-semibold">プラン</h2>
                                    <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
                                        <button
                                            onClick={() => setBillingCycle("monthly")}
                                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${billingCycle === "monthly"
                                                ? "bg-white text-black shadow-sm"
                                                : "text-neutral-500 hover:text-black"
                                                }`}
                                        >
                                            月払い
                                        </button>
                                        <button
                                            onClick={() => setBillingCycle("yearly")}
                                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${billingCycle === "yearly"
                                                ? "bg-white text-black shadow-sm"
                                                : "text-neutral-500 hover:text-black"
                                                }`}
                                        >
                                            年払い（2ヶ月分お得）
                                        </button>
                                    </div>
                                </div>

                                {subscriptionLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Plan Cards Grid */}
                                        <div className="grid gap-4 md:grid-cols-3">
                                            {/* Free Plan Card */}
                                            {(() => {
                                                const isCurrent = !subscription ||
                                                    subscription.status === "FREE" ||
                                                    (subscription.plan.type === "FREE") ||
                                                    (subscription.status === "CANCELLED" && (!subscription.endDate || new Date(subscription.endDate) <= new Date()));
                                                return (
                                                    <div className={`relative rounded-2xl border-2 p-5 transition-all ${isCurrent
                                                        ? "border-green-500 bg-green-50/50"
                                                        : "border-black/10 bg-white hover:border-black/20"
                                                        }`}>
                                                        {isCurrent && (
                                                            <div className="absolute -top-2.5 right-4 rounded-full bg-green-500 px-3 py-0.5 text-xs font-bold text-white">
                                                                利用中
                                                            </div>
                                                        )}
                                                        <h3 className="text-lg font-bold text-neutral-900">Free</h3>
                                                        <div className="mt-2 flex items-baseline gap-1">
                                                            <span className="text-3xl font-bold">¥0</span>
                                                            <span className="text-sm text-neutral-500">/月</span>
                                                        </div>
                                                        <p className="mt-2 text-xs text-neutral-600">手数料率: {subscription?.plan?.type === "FREE" ? (subscription.plan.feeRate < 1 ? subscription.plan.feeRate * 100 : subscription.plan.feeRate) : 8}%</p>

                                                        {isCurrent ? (
                                                            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-green-100 py-2.5 text-sm font-semibold text-green-700">
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                現在のプラン
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleSelectPlan("FREE")}
                                                                disabled={selectingPlan !== null}
                                                                className="mt-5 w-full rounded-xl border border-black/10 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                                                            >
                                                                {selectingPlan === "FREE" ? "処理中..." : "ダウングレード"}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Dynamic Plan Cards */}
                                            {allPlans
                                                .filter(p => p.type !== "FREE")
                                                .map((plan) => {
                                                    const isCurrent = subscription && subscription.plan.type === plan.type && (
                                                        subscription.status === "ACTIVE" ||
                                                        subscription.status === "PENDING" ||
                                                        (subscription.status === "CANCELLED" && subscription.endDate && new Date(subscription.endDate) > new Date())
                                                    );
                                                    const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                                                    const displayPrice = billingCycle === "yearly" && price > 0 ? Math.floor(price / 12) : price;
                                                    const isCancelled = isCurrent && subscription?.status === "CANCELLED";

                                                    return (
                                                        <div
                                                            key={plan.id}
                                                            className={`relative rounded-2xl border-2 p-5 transition-all ${isCurrent
                                                                ? isCancelled
                                                                    ? "border-blue-400 bg-white"   // キャンセル済みの今のプランは青枠
                                                                    : "border-blue-500 bg-blue-50/50" // アクティブな今のプラン
                                                                : "border-black/10 bg-white hover:border-black/20"
                                                                }`}
                                                        >
                                                            {isCurrent && (
                                                                <div className="absolute -top-2.5 right-4 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-bold text-white">
                                                                    {subscription?.status === "PENDING" ? "入金待ち" : "利用中"}
                                                                </div>
                                                            )}
                                                            <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                                                            <div className="mt-2 flex items-baseline gap-1">
                                                                <span className="text-3xl font-bold">
                                                                    ¥{displayPrice.toLocaleString()}
                                                                </span>
                                                                <span className="text-sm text-neutral-500">/月</span>
                                                            </div>
                                                            {billingCycle === "yearly" && (
                                                                <p className="mt-0.5 text-xs text-neutral-500">
                                                                    年間 ¥{price.toLocaleString()}
                                                                </p>
                                                            )}
                                                            <p className="mt-2 text-xs text-neutral-600">
                                                                手数料率: {plan.feeRate < 1 ? plan.feeRate * 100 : plan.feeRate}%
                                                            </p>

                                                            {isCurrent ? (
                                                                <div className="mt-5 space-y-2">
                                                                    <div className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold ${isCancelled ? "bg-blue-50 text-blue-600" : "bg-blue-100 text-blue-700"}`}>
                                                                        {isCancelled ? (
                                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                        {subscription?.status === "PENDING" ? "入金待ち" : isCancelled ? "キャンセル済み（利用期間中）" : "現在のプラン"}
                                                                    </div>
                                                                    {subscription?.status === "PENDING" && virtualAccount && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const price = subscription.isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                                                                                setPaymentModalInfo({
                                                                                    amount: price,
                                                                                    planName: plan.name,
                                                                                    isYearly: subscription.isYearly,
                                                                                    virtualAccount,
                                                                                });
                                                                                setShowPaymentModal(true);
                                                                            }}
                                                                            className="w-full rounded-xl border border-blue-300 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                                                        >
                                                                            振込先を確認する
                                                                        </button>
                                                                    )}
                                                                    {subscription?.status === "ACTIVE" && (
                                                                        <button
                                                                            onClick={() => setShowCancelModal(true)}
                                                                            className="w-full text-xs font-medium text-pink-600 transition hover:text-pink-700"
                                                                        >
                                                                            キャンセルする
                                                                        </button>
                                                                    )}
                                                                    {isCancelled && (
                                                                        <button
                                                                            onClick={() => handleSelectPlan(plan.type)}
                                                                            className="w-full text-xs font-medium text-blue-600 transition hover:text-blue-700"
                                                                        >
                                                                            利用を再開する
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleSelectPlan(plan.type)}
                                                                    disabled={selectingPlan !== null}
                                                                    className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                                                >
                                                                    {selectingPlan === plan.type ? "処理中..." : "利用する"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        {/* Billing Balance - always show when subscription exists */}
                                        {subscription && (
                                            <div className="rounded-2xl border border-black/10 bg-white p-6">
                                                <h3 className="mb-3 text-sm font-semibold text-neutral-700">プリペイド残高</h3>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-neutral-900">
                                                        ¥{(subscription.billingBalance ?? 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs text-neutral-600">
                                                    この口座に振り込んでおくと、更新日に自動引き落としされます。
                                                </p>
                                                {/* Low balance alert - only for ACTIVE paid plans */}
                                                {subscription.status === "ACTIVE" && subscription.nextBillingDate && (() => {
                                                    const requiredAmount = subscription.isYearly
                                                        ? subscription.plan.yearlyPrice
                                                        : subscription.plan.monthlyPrice;
                                                    const isLowBalance = subscription.billingBalance < requiredAmount;
                                                    if (isLowBalance) {
                                                        return (
                                                            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                                                                <div className="flex items-start gap-3">
                                                                    <span className="text-yellow-600">⚠️</span>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-yellow-900">残高不足</p>
                                                                        <p className="mt-1 text-xs text-yellow-800">
                                                                            次回更新日（{new Date(subscription.nextBillingDate).toLocaleDateString("ja-JP")}）に
                                                                            ¥{requiredAmount.toLocaleString()}が必要です。
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        )}

                                        {/* Pricing Page Link */}
                                        <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-neutral-50 px-5 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-800">プラン詳細を見る</p>
                                                <p className="text-xs text-neutral-500">各プランの機能比較一覧</p>
                                            </div>
                                            <Link href="/creators/pricing">
                                                <button className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800">
                                                    プラン一覧
                                                </button>
                                            </Link>
                                        </div>

                                        {/* Virtual Account Info */}
                                        {virtualAccount && (
                                            <div id="virtual-account-info" className="rounded-2xl border border-black/10 bg-white p-6 scroll-mt-20">
                                                <h3 className="mb-3 text-sm font-semibold text-neutral-700">あなたの専用振込口座</h3>
                                                <p className="mb-4 text-xs text-neutral-600">
                                                    この口座に振り込むと、自動的にプリペイド残高にチャージされます。
                                                </p>
                                                <div className="space-y-3 rounded-2xl bg-neutral-50 p-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-neutral-600">銀行名</span>
                                                        <span className="font-mono font-semibold text-neutral-900">GMOあおぞらネット銀行</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-neutral-600">支店名</span>
                                                        <span className="font-mono font-semibold text-neutral-900">
                                                            {virtualAccount.branchName
                                                                ? virtualAccount.branchName.includes('（') || virtualAccount.branchName.includes('(')
                                                                    ? virtualAccount.branchName
                                                                    : `${virtualAccount.branchName}（${virtualAccount.branchCode}）`
                                                                : `${virtualAccount.branchCode || "001"}支店`}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-neutral-600">口座種別</span>
                                                        <span className="font-mono font-semibold text-neutral-900">普通</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-neutral-600">口座番号</span>
                                                        <span className="font-mono font-semibold text-blue-600">
                                                            {virtualAccount.accountNumber}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-neutral-600">口座名義</span>
                                                        <span className="font-mono font-semibold text-neutral-900">
                                                            {virtualAccount.accountName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Terms */}
                                        <p className="text-sm text-neutral-600">
                                            <a href="/terms/creators" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                利用規約
                                            </a>
                                            {" "}と{" "}
                                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                プライバシーポリシー
                                            </a>
                                            をご確認ください
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "notifications" && (
                            <section className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <h2 className="mb-6 text-xl font-semibold">メール受信を設定</h2>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="maintenance"
                                            checked={maintenanceNotification}
                                            onChange={(e) => setMaintenanceNotification(e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="maintenance" className="text-sm text-neutral-700">
                                            機能更新・メンテナンス
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button className="rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                                        変更する
                                    </button>
                                </div>
                            </section>
                        )}

                        {activeTab === "domain" && (
                            <section className="relative rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                {/* Upgrade Overlay */}
                                {creatorProfile && !creatorProfile.hasAccess && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/95 backdrop-blur-sm">
                                        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                                            <h2 className="mb-4 text-2xl font-bold text-gray-900">
                                                独自ドメイン機能
                                            </h2>
                                            <p className="mb-6 text-gray-600">
                                                独自ドメインを使用するには、LiteまたはBusinessプランへのアップグレードが必要です。
                                            </p>
                                            <button
                                                onClick={() => router.push("/creators/pricing")}
                                                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                                            >
                                                プランをアップグレード
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <h2 className="mb-2 text-2xl font-semibold">独自ドメイン設定</h2>
                                <p className="mb-6 text-sm text-gray-600">
                                    独自ドメインを接続して、プロフェッショナルなサイトを運営できます。
                                    {creatorProfile?.planType && ` (現在のプラン: ${creatorProfile.planType})`}
                                </p>

                                {domainError && (
                                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                                        <p className="text-sm text-red-800">{domainError}</p>
                                    </div>
                                )}

                                {/* Domain Input */}
                                {!domainData ? (
                                    <div className="mb-8 space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700">
                                                ドメイン名
                                            </label>
                                            <input
                                                type="text"
                                                value={domainInput}
                                                onChange={(e) => setDomainInput(e.target.value)}
                                                placeholder="example.com"
                                                className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                サブドメインは含めず、メインドメインのみを入力してください
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleSaveDomain}
                                            disabled={domainLoading || !domainInput.trim()}
                                            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {domainLoading ? "登録中..." : "ドメインを登録"}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Current Domain */}
                                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 rounded-2xl border border-black/10 bg-white p-4">
                                            <div>
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-black">{domainData.domain}</span>
                                                    {getStatusBadge(domainData.status)}
                                                </div>
                                                {domainData.lastError && (
                                                    <p className="text-xs text-red-600">{domainData.lastError}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleVerifyDomain}
                                                    disabled={domainVerifying || domainData.status === "ACTIVE"}
                                                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {domainVerifying ? "検証中..." : "検証"}
                                                </button>
                                                <button
                                                    onClick={handleDeleteDomain}
                                                    disabled={domainLoading}
                                                    className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                                                >
                                                    削除
                                                </button>
                                            </div>
                                        </div>

                                        {/* DNS Setup Instructions */}
                                        {domainData.sslValidationRecords && domainData.sslValidationRecords.length > 0 && (
                                            <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                                                <h3 className="mb-3 text-sm font-semibold text-blue-900">DNS設定手順</h3>
                                                <p className="mb-4 text-sm text-blue-800">
                                                    以下のDNSレコードをドメインのDNS設定に追加してください。
                                                </p>

                                                <div className="space-y-4">
                                                    {domainData.sslValidationRecords.map((record, index) => (
                                                        <div key={index} className="rounded-2xl border border-blue-200 bg-white p-4">
                                                            <div className="grid gap-2">
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">レコードタイプ:</span>
                                                                    <p className="font-mono text-sm">TXT</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">名前:</span>
                                                                    <p className="break-all font-mono text-sm">{record.txt_name}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500">値:</span>
                                                                    <p className="break-all font-mono text-sm">{record.txt_value}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <p className="mt-4 text-xs text-blue-700">
                                                    DNS設定の反映には最大48時間かかる場合がありますが、通常は数分から数時間で完了します。
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* General DNS Setup Instructions */}
                                {!domainData && (
                                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                                        <h3 className="mb-3 text-sm font-semibold text-blue-900">DNS設定手順</h3>
                                        <ol className="space-y-2 text-sm text-blue-800">
                                            <li>1. 上記のフォームからドメインを登録</li>
                                            <li>2. 表示されるDNSレコードをドメインプロバイダーで設定</li>
                                            <li>3. 「検証」ボタンをクリックして確認</li>
                                            <li>4. 検証が完了すると、ドメインが有効になります</li>
                                        </ol>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>

                {/* Footer with Legal Links */}
                <footer className="mt-8 md:mt-12 border-t border-neutral-200 pt-6 px-4 md:px-0 pb-8 md:pb-0">
                    <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 md:gap-6 text-sm text-neutral-600">
                        <a href="/terms/creators" target="_blank" className="hover:text-blue-600 hover:underline">
                            利用規約
                        </a>
                        <span className="text-neutral-300">|</span>
                        <a href="/legal/commercial-transaction/creators" target="_blank" className="hover:text-blue-600 hover:underline">
                            特定商取引法に基づく表記
                        </a>
                        <span className="text-neutral-300">|</span>
                        <a href="/privacy" target="_blank" className="hover:text-blue-600 hover:underline">
                            プライバシーポリシー
                        </a>
                    </div>
                </footer>
            </div>

            {/* Cancel Subscription Modal */}
            {showCancelModal && subscription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
                        <h3 className="mb-4 text-xl font-semibold">サブスクリプションのキャンセル</h3>
                        <p className="mb-6 text-sm text-neutral-600">
                            {subscription.plan.name}プランをキャンセルしますか？
                            {(subscription.nextBillingDate || subscription.endDate) && (
                                <>
                                    <br />
                                    <br />
                                    {new Date(subscription.nextBillingDate || subscription.endDate!).toLocaleDateString("ja-JP")}まで引き続き利用できますが、その後は自動更新されません。
                                </>
                            )}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={isCancelling}
                                className="flex-1 rounded-2xl border border-black/10 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className="flex-1 rounded-2xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
                            >
                                {isCancelling ? "キャンセル中..." : "キャンセルする"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Instruction Modal */}
            {showPaymentModal && paymentModalInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">お振込のご案内</h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-neutral-400 hover:text-neutral-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* 金額 */}
                            <div className="rounded-2xl bg-blue-50 p-5">
                                <p className="text-xs text-neutral-600">お支払い金額</p>
                                <p className="mt-1 text-3xl font-bold text-blue-600">
                                    ¥{paymentModalInfo.amount.toLocaleString()}
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    {paymentModalInfo.planName}プラン（{paymentModalInfo.isYearly ? "年払い" : "月払い"}）
                                </p>
                            </div>

                            {/* 振込先 */}
                            <div className="space-y-3 rounded-2xl border border-black/10 p-5">
                                <h4 className="text-sm font-semibold text-neutral-800">振込先口座</h4>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">銀行名</span>
                                        <span className="font-semibold">GMOあおぞらネット銀行</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">支店名</span>
                                        <span className="font-semibold">
                                            {paymentModalInfo.virtualAccount.branchName
                                                ? paymentModalInfo.virtualAccount.branchName.includes('（') || paymentModalInfo.virtualAccount.branchName.includes('(')
                                                    ? paymentModalInfo.virtualAccount.branchName
                                                    : `${paymentModalInfo.virtualAccount.branchName}（${paymentModalInfo.virtualAccount.branchCode}）`
                                                : `${paymentModalInfo.virtualAccount.branchCode || "001"}支店`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">口座種別</span>
                                        <span className="font-semibold">普通</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">口座番号</span>
                                        <span className="font-mono text-lg font-bold text-blue-600">
                                            {paymentModalInfo.virtualAccount.accountNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">口座名義</span>
                                        <span className="font-semibold">{paymentModalInfo.virtualAccount.accountName}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 注意事項 */}
                            <div className="rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-600 space-y-1">
                                <p>• 振込手数料はお客様のご負担となります</p>
                                <p>• 入金確認後、自動的にプランが有効化されます</p>
                                <p>• 入金確認は10分〜1日程度かかる場合があります</p>
                            </div>

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full rounded-2xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Plan Modal */}
            {showConfirmModal && confirmingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
                        <h3 className="mb-4 text-xl font-semibold">プランの確認</h3>
                        <div className="mb-6 text-sm text-neutral-600">
                            <p className="mb-2">
                                {allPlans.find(p => p.type === confirmingPlan)?.name}プランを利用しますか？
                            </p>
                            {!virtualAccount && (
                                <p className="mb-2 text-xs text-neutral-500">このプランを選択すると、システムからあなた専用の口座が割り当てられます。</p>
                            )}
                            {subscription?.status === "ACTIVE" && (
                                <div className="mt-3 rounded-xl bg-blue-50 p-4 text-xs leading-relaxed text-blue-800">
                                    <p className="font-semibold mb-1">【プラン変更について】</p>
                                    <p>現在のプランの未使用期間分が日割りで計算され、新しいプラン料金との差額がプリペイド残高から引き落とされ、即座にプランが切り替わります。</p>
                                    <p className="mt-2 text-pink-600 font-semibold">※事前の残高チャージが必要です。残高が不足している場合は変更できません。</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowConfirmModal(false); setConfirmingPlan(null); }}
                                disabled={selectingPlan !== null}
                                className="flex-1 rounded-2xl border border-black/10 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                            >
                                戻る
                            </button>
                            <button
                                onClick={() => executeSelectPlan(confirmingPlan)}
                                disabled={selectingPlan !== null}
                                className="flex-1 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {selectingPlan === confirmingPlan ? "処理中..." : "利用する"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
