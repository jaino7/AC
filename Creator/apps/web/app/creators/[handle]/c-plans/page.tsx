"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Plan = {
    id: string;
    name: string;
    price: number;
    period: "monthly" | "yearly";
    isPublic: boolean;
    isRequired?: boolean;
    subscriberCount: number;
    perks: string[];
    description?: string | null;
};

type PlanFormData = {
    name: string;
    price: number;
    description: string;
    detailDescription: string;
    isPublic: boolean;
    archiveAccess: "all" | "limited" | "new_only";
    archiveMonths: number; // limitedの場合に使用
    includesPurchasedContent: boolean; // 単体購入コンテンツを含むか
};

function PlanCard({
    plan,
    onEdit,
    onDelete
}: {
    plan: Plan;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [showMenu, setShowMenu] = React.useState(false);
    return (
        <div className="relative flex flex-col md:flex-row md:items-stretch gap-4 rounded-xl border border-black/10 bg-white p-5 shadow-sm">

            <div className="flex flex-1 flex-col gap-2 pr-8 md:pr-0">
                <h3 className="text-xl font-bold text-black">{plan.name}</h3>

                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#223C7D]">
                        ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-black/50">/ 月</span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-sm text-black/60">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span>{plan.subscriberCount.toLocaleString()} 人が加入中</span>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                {plan.perks && plan.perks.length > 0 ? (
                    <>
                        <span className="text-sm text-black/50">主な特典</span>
                        <ul className="space-y-1">
                            {plan.perks.map((perk, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-black/80">
                                    <svg className="h-4 w-4 text-[#223C7D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20,6 9,17 4,12" />
                                    </svg>
                                    {perk}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : plan.description ? (
                    <>
                        <span className="text-sm text-black/50">プラン概要</span>
                        <p className="text-sm text-black/70 break-words overflow-wrap-anywhere">{plan.description}</p>
                    </>
                ) : null}
            </div>

            <div className="absolute right-4 top-4 md:relative md:right-auto md:top-auto flex items-center gap-2">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-black/40 transition-colors hover:text-black"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>

                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-10 z-20 w-32 rounded-lg border border-black/10 bg-white shadow-lg">
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onEdit();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-black transition-colors hover:bg-black/5"
                            >
                                編集
                            </button>
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onDelete();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                            >
                                削除
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function DeleteConfirmModal({
    planName,
    onConfirm,
    onCancel
}: {
    planName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black">プランを削除しますか？</h3>
                </div>

                <p className="mb-4 text-sm text-black/70">
                    「{planName}」を削除しようとしています。
                </p>

                <div className="mb-6 rounded-lg bg-red-50 p-4">
                    <ul className="space-y-1 text-sm text-red-800">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>このプランに加入中のメンバーは全員解約されます</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>この操作は元に戻せません</span>
                        </li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-lg border border-black/20 px-4 py-3 font-medium text-black transition-colors hover:bg-black/5"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700"
                    >
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlanEditModal({
    onClose,
    onSave,
    planId,
    initialData
}: {
    onClose: () => void;
    onSave: (formData: PlanFormData, planId?: string) => Promise<void>;
    planId?: string;
    initialData?: Partial<PlanFormData>;
}) {
    const [formData, setFormData] = useState<PlanFormData>({
        name: initialData?.name || "",
        price: initialData?.price || 500,
        description: initialData?.description || "",
        detailDescription: initialData?.detailDescription || "",
        isPublic: initialData?.isPublic ?? true,
        archiveAccess: initialData?.archiveAccess || "all",
        archiveMonths: initialData?.archiveMonths || 3,
        includesPurchasedContent: initialData?.includesPurchasedContent ?? false
    });

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 md:py-10">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl md:p-8">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg border border-black/10 p-2 text-black/60 transition-colors hover:bg-black/5 hover:text-black md:right-6 md:top-6"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-black">プラン作成・編集</h2>
                <p className="mt-1 text-sm text-black/60">ファンクラブのサブスクリプションプランを設定します。</p>

                <div className="mt-8 space-y-6">
                    {/* 基本情報 */}
                    <section>
                        <h3 className="flex items-center gap-2 text-base font-semibold text-black">
                            <span className="text-[#223C7D]">📝</span>
                            基本情報
                        </h3>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm text-black/70">
                                    プラン名 <span className="text-black/40">(30文字以内)</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={30}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="例: プレミアムプラン"
                                    className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder-black/30 focus:border-[#223C7D] focus:outline-none"
                                />
                                <div className="mt-1 text-right text-xs text-black/40">
                                    {formData.name.length} / 30
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-black/70">料金 (円/月)</label>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        disabled={!!planId}
                                        min={100}
                                        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black disabled:opacity-50 focus:border-[#223C7D] focus:outline-none"
                                    />
                                </div>
                                {planId && (
                                    <p className="mt-2 text-xs text-black/50">
                                        料金は作成後に変更できません
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-black/70">
                                    プラン概要 <span className="text-black/40">(一覧表示用)</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="プランの魅力を短い文章で説明してください"
                                    rows={2}
                                    className="mt-2 w-full resize-none rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder-black/30 focus:border-[#223C7D] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-black/70">詳細説明</label>
                                <div className="mt-2 flex gap-2 border-b border-black/10 pb-2">
                                    <button type="button" className="rounded p-1 text-black/60 hover:bg-black/5">
                                        <strong>B</strong>
                                    </button>
                                    <button type="button" className="rounded p-1 text-black/60 hover:bg-black/5">
                                        <em>I</em>
                                    </button>
                                    <button type="button" className="rounded p-1 text-black/60 hover:bg-black/5">
                                        ≡
                                    </button>
                                    <button type="button" className="rounded p-1 text-black/60 hover:bg-black/5">
                                        🔗
                                    </button>
                                    <button type="button" className="rounded p-1 text-black/60 hover:bg-black/5">
                                        📷
                                    </button>
                                </div>
                                <textarea
                                    value={formData.detailDescription}
                                    onChange={(e) => setFormData({ ...formData, detailDescription: e.target.value })}
                                    placeholder="ここにプランの詳細を記述してください..."
                                    rows={4}
                                    className="mt-2 w-full resize-none rounded-lg border border-black/10 bg-white px-4 py-3 text-black placeholder-black/30 focus:border-[#223C7D] focus:outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* コンテンツアクセス設定 */}
                    <section>
                        <h3 className="flex items-center gap-2 text-base font-semibold text-black">
                            <span className="text-yellow-600">🔒</span>
                            コンテンツアクセス設定
                        </h3>

                        <div className="mt-4 flex items-center gap-4">
                            <label className="text-sm text-black/70">ステータス:</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                                className={`relative h-6 w-12 rounded-full transition-colors ${formData.isPublic ? "bg-[#223C7D]" : "bg-black/20"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${formData.isPublic ? "left-7" : "left-1"
                                        }`}
                                />
                            </button>
                            <span className="text-sm text-black/70">{formData.isPublic ? "公開中" : "非公開"}</span>
                        </div>

                        <p className="mt-6 text-sm text-black/70">
                            このプランの加入者がアクセスできる過去の投稿範囲を設定します。
                            <br />
                            （個別の投稿の公開設定は、投稿作成画面で行います。）
                        </p>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-black/80 mb-2">アーカイブアクセス権</label>
                            <select
                                value={formData.archiveAccess}
                                onChange={(e) => setFormData({ ...formData, archiveAccess: e.target.value as "all" | "limited" | "new_only" })}
                                className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black focus:border-[#223C7D] focus:outline-none"
                            >
                                <option value="all">過去の全投稿</option>
                                <option value="limited">過去 [数値] ヶ月分の投稿</option>
                                <option value="new_only">新規投稿のみ</option>
                            </select>

                            {formData.archiveAccess === "limited" && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-sm text-black/70">過去</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={formData.archiveMonths}
                                        onChange={(e) => setFormData({ ...formData, archiveMonths: Number(e.target.value) })}
                                        className="w-20 rounded-lg border border-black/10 bg-white px-3 py-2 text-center text-black focus:border-[#223C7D] focus:outline-none"
                                    />
                                    <span className="text-sm text-black/70">ヶ月分の投稿</span>
                                </div>
                            )}

                            <label className="mt-4 flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.includesPurchasedContent}
                                    onChange={(e) => setFormData({ ...formData, includesPurchasedContent: e.target.checked })}
                                    className="mt-0.5 h-4 w-4 rounded border-black/20 bg-white accent-[#223C7D]"
                                />
                                <div>
                                    <span className="text-sm font-medium text-black/80">単体購入コンテンツも含める</span>
                                    <p className="mt-1 text-xs text-black/50">
                                        チェックすると、プランメンバーは過去の単体購入専用コンテンツにも無料でアクセスできます
                                    </p>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>

                {/* フッターアクション */}
                <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-black/10 px-6 py-2 text-sm text-black/60 transition-colors hover:bg-black/5"
                    >
                        キャンセル
                    </button>
                    <button
                        type="button"
                        onClick={() => onSave(formData, planId)}
                        className="flex items-center gap-2 rounded-lg bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-black/80"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                        </svg>
                        保存する
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PlansSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const handle = params?.handle as string;

    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

    // 認証チェック
    useEffect(() => {
        if (status === "loading") return;

        if (!session || (session.user as any).handle !== handle) {
            router.push("/creators/login");
        }
    }, [session, status, handle, router]);

    // プラン一覧を取得
    useEffect(() => {
        if (!handle || status !== "authenticated") return;
        fetchPlans();
    }, [handle, status]);

    async function fetchPlans() {
        try {
            setLoading(true);
            const res = await fetch(`/api/creators/${handle}/plans`);
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error("プラン取得エラー:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleEditPlan = (plan: Plan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleCreatePlan = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleDeletePlan = async (plan: Plan) => {
        setDeletingPlan(plan);
    };

    const confirmDeletePlan = async () => {
        if (!deletingPlan) return;

        try {
            const res = await fetch(`/api/creators/${handle}/plans/${deletingPlan.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                await fetchPlans(); // 再取得
                setDeletingPlan(null);
            } else {
                alert("削除に失敗しました");
            }
        } catch (error) {
            console.error("削除エラー:", error);
            alert("削除に失敗しました");
        }
    };

    const handleSavePlan = async (formData: PlanFormData, planId?: string) => {
        try {
            setSaving(true);

            const payload = {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                perks: [] // ※将来的にフォームから取得
            };

            const url = planId
                ? `/api/creators/${handle}/plans/${planId}`
                : `/api/creators/${handle}/plans`;

            const method = planId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                await fetchPlans(); // 再取得
            } else {
                alert("保存に失敗しました");
            }
        } catch (error) {
            console.error("保存エラー:", error);
            alert("保存に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <main className="min-h-screen bg-white px-0 py-6 md:px-6 md:py-10 text-black lg:px-12">
                <div className="mx-auto max-w-5xl px-4 md:px-0">
                    <p className="text-center text-black/60">読み込み中...</p>
                </div>
            </main>
        );
    }

    const hasPlan = plans.length > 0;

    return (
        <main className="min-h-screen bg-white px-0 py-6 md:px-6 md:py-10 text-black lg:px-12">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* ページヘッダー */}
                <header className="flex flex-col gap-3 px-4 md:flex-row md:items-start md:justify-between md:px-0">
                    <div>
                        <h1 className="text-3xl font-bold">プラン設定</h1>
                        <p className="mt-1 text-sm text-black/60">
                            ファンクラブのサブスクリプションプランを設定します。現在は1プランのみ設定できます。
                        </p>
                    </div>
                    {!hasPlan && (
                        <button
                            onClick={handleCreatePlan}
                            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-black/80 md:self-start"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            プランを作成
                        </button>
                    )}
                </header>

                {/* プラン一覧 */}
                {hasPlan ? (
                    <section className="space-y-4 px-4 md:px-0">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={() => handleEditPlan(plan)}
                                onDelete={() => handleDeletePlan(plan)}
                            />
                        ))}
                    </section>
                ) : (
                    /* プランなし状態 */
                    <div className="px-4 md:px-0">
                        <button
                            onClick={handleCreatePlan}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 bg-white py-12 text-black/60 transition-colors hover:border-black/30 hover:bg-black/5"
                        >
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* 編集モーダル */}
            {isModalOpen && (
                <PlanEditModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePlan}
                    planId={editingPlan?.id}
                    initialData={
                        editingPlan
                            ? {
                                name: editingPlan.name,
                                price: editingPlan.price,
                                isPublic: editingPlan.isPublic,
                                description: editingPlan.description || ""
                            }
                            : undefined
                    }
                />
            )}
            {/* 削除確認モーダル */}
            {deletingPlan && (
                <DeleteConfirmModal
                    planName={deletingPlan.name}
                    onConfirm={confirmDeletePlan}
                    onCancel={() => setDeletingPlan(null)}
                />
            )}
        </main>
    );
}
