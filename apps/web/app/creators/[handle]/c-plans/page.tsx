"use client";

import { useState, useEffect } from "react";
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
    period: "monthly";
    description: string;
    detailDescription: string;
    isPublic: boolean;
    archiveAccess: "all" | "limited" | "new_only";
    archiveMonths: number; // limitedの場合に使用
};

function PlanCard({
    plan,
    onEdit,
    onDelete,
    isDraggable = true
}: {
    plan: Plan;
    onEdit: () => void;
    onDelete: () => void;
    isDraggable?: boolean;
}) {
    return (
        <div className="flex items-stretch gap-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            {isDraggable && (
                <div className="flex cursor-grab items-center text-black/40 active:cursor-grabbing">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                    </svg>
                </div>
            )}

            <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                    {plan.isRequired && (
                        <span className="rounded border border-black/20 bg-black/5 px-2 py-0.5 text-xs text-black/70">
                            必須
                        </span>
                    )}
                    <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${plan.isPublic
                            ? "bg-[#223C7D]/20 text-[#223C7D]"
                            : "bg-black/5 text-black/50"
                            }`}
                    >
                        {plan.isPublic ? (
                            <>
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                公開中
                            </>
                        ) : (
                            <>
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4" y1="4" x2="20" y2="20" />
                                </svg>
                                非公開
                            </>
                        )}
                    </span>
                </div>

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

            <div className="flex flex-col gap-2">
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
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onEdit}
                    className="rounded-lg border border-black/20 bg-black/5 px-4 py-2 text-sm text-black transition-colors hover:bg-black/10"
                >
                    編集
                </button>
                <button onClick={onDelete} className="p-2 text-black/40 transition-colors hover:text-red-600">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>
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
        period: "monthly",
        description: initialData?.description || "",
        detailDescription: initialData?.detailDescription || "",
        isPublic: initialData?.isPublic ?? true,
        archiveAccess: initialData?.archiveAccess || "all",
        archiveMonths: initialData?.archiveMonths || 3
    });

    const [isFree, setIsFree] = useState(formData.price === 0);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-10">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-lg border border-black/10 p-2 text-black/60 transition-colors hover:bg-black/5 hover:text-black"
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

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-black/70">料金 (円)</label>
                                    <div className="mt-2 flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={isFree ? 0 : formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            disabled={isFree}
                                            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-black disabled:opacity-50 focus:border-[#223C7D] focus:outline-none"
                                        />
                                        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-black/70">
                                            <input
                                                type="checkbox"
                                                checked={isFree}
                                                onChange={(e) => {
                                                    setIsFree(e.target.checked);
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, price: 0 });
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-black/20 bg-white accent-[#223C7D]"
                                            />
                                            無料にする
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-black/70">期間</label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value as "monthly" })}
                                        className="mt-2 w-full appearance-none rounded-lg border border-black/10 bg-white px-4 py-3 text-black focus:border-[#223C7D] focus:outline-none"
                                    >
                                        <option value="monthly">1ヶ月 (月額)</option>
                                    </select>
                                </div>
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

    const handleDeletePlan = async (planId: string) => {
        if (!confirm("このプランを削除しますか?")) return;

        try {
            const res = await fetch(`/api/creators/${handle}/plans/${planId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                await fetchPlans(); // 再取得
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
            <main className="min-h-screen bg-neutral-50 px-6 py-10 text-black lg:px-12">
                <div className="mx-auto max-w-5xl">
                    <p className="text-center text-black/60">読み込み中...</p>
                </div>
            </main>
        );
    }

    const freePlan = plans.find((p) => p.price === 0);
    const paidPlans = plans.filter((p) => p.price > 0);

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-10 text-black lg:px-12">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* ページヘッダー */}
                <header className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">プラン設定</h1>
                        <p className="mt-1 text-sm text-black/60">
                            ファンのためのサブスクリプションプランを管理・設定します。
                        </p>
                    </div>
                    <button
                        onClick={handleCreatePlan}
                        className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition-colors hover:bg-black/80"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        新しいプランを作成
                    </button>
                </header>

                {/* 無料プラン */}
                {freePlan && (
                    <section>
                        <PlanCard
                            plan={freePlan}
                            onEdit={() => handleEditPlan(freePlan)}
                            onDelete={() => handleDeletePlan(freePlan.id)}
                            isDraggable={false}
                        />
                    </section>
                )}

                {/* 有料プラン */}
                <section>
                    <p className="mb-4 text-center text-sm text-black/50">
                        有料プラン（ドラッグして並べ替え）
                    </p>
                    <div className="space-y-4">
                        {paidPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={() => handleEditPlan(plan)}
                                onDelete={() => handleDeletePlan(plan.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* 新しいプランを追加ボタン */}
                <button
                    onClick={handleCreatePlan}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 bg-white py-6 text-black/60 transition-colors hover:border-black/30 hover:bg-black/5"
                >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    新しいプランを追加
                </button>
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
        </main>
    );
}
