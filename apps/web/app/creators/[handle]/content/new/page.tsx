"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

type PublishMode = "publish" | "draft" | "scheduled";

interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number;
}

export default function NewContentPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [publishMode, setPublishMode] = useState<PublishMode>("publish");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [accessPermission, setAccessPermission] = useState<"everyone" | "plans" | "single_sale">("everyone");
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [singleSalePrice, setSingleSalePrice] = useState<string>("");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // プラン一覧を取得
    useEffect(() => {
        const fetchPlans = async () => {
            setLoadingPlans(true);
            try {
                const response = await fetch("/api/creators/plans");
                if (response.ok) {
                    const data = await response.json();
                    setPlans(data.plans || []);
                }
            } catch (error) {
                console.error("Failed to fetch plans:", error);
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchPlans();
    }, []);

    // R2にファイルをアップロード
    const uploadFileToR2 = async (file: File): Promise<string> => {
        // 1. Presigned URLを取得
        const presignedResponse = await fetch("/api/upload/get-upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
            }),
        });

        if (!presignedResponse.ok) {
            throw new Error("署名付きURLの取得に失敗しました");
        }

        const { uploadUrl, fileUrl, key } = await presignedResponse.json();

        // 2. R2に直接アップロード
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error("ファイルのアップロードに失敗しました");
        }

        // 3. アップロード完了を通知
        const confirmResponse = await fetch("/api/upload/confirm-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                key,
                fileUrl,
                filename: file.name,
                contentType: file.type,
                size: file.size,
            }),
        });

        if (!confirmResponse.ok) {
            throw new Error("アップロード確認に失敗しました");
        }

        return fileUrl;
    };

    // 共通のファイル処理関数
    const processFiles = async (files: File[]) => {
        setUploadedFiles(files);
        setUploadingFiles(true);
        setErrorMessage(null);

        try {
            // 全ファイルをアップロード
            const uploadPromises = files.map((file) => uploadFileToR2(file));
            const urls = await Promise.all(uploadPromises);
            setUploadedFileUrls(urls);
            setSuccessMessage(`${files.length}件のファイルをアップロードしました`);
        } catch (error: any) {
            setErrorMessage(error.message || "ファイルのアップロードに失敗しました");
            setUploadedFiles([]);
            setUploadedFileUrls([]);
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        await processFiles(files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await processFiles(files);
        }
    };

    const createContentMutation = useMutation({
        mutationFn: async (data: {
            title: string;
            content: string;
            visibility: string;
            mediaUrl?: string;
            isLocked: boolean;
            requiredPlanId?: string;
            singleSalePrice?: number;
        }) => {
            const response = await fetch("/api/creators/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "投稿の作成に失敗しました");
            }

            return response.json();
        },
        onSuccess: () => {
            setSuccessMessage("投稿を作成しました");
            setTimeout(() => {
                router.back();
            }, 1500);
        },
        onError: (error: Error) => {
            setErrorMessage(error.message);
        },
    });

    const handlePublish = () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!title.trim()) {
            setErrorMessage("タイトルは必須です");
            return;
        }

        // アップロード済みのファイルURLを使用
        const mediaUrl = uploadedFileUrls.length > 0 ? uploadedFileUrls[0] : undefined;

        let visibility = "PUBLIC";
        if (publishMode === "draft") {
            visibility = "DRAFT";
        } else if (publishMode === "scheduled") {
            // 予約投稿の場合も一旦DRAFTとして保存
            // 実際の予約投稿機能は別途スケジューラーが必要
            visibility = "DRAFT";
        }

        createContentMutation.mutate({
            title,
            content: body,
            visibility,
            mediaUrl,
            isLocked: accessPermission === "plans" || accessPermission === "single_sale",
            requiredPlanId: accessPermission === "plans" ? selectedPlanId : undefined,
            singleSalePrice: accessPermission === "single_sale" && singleSalePrice ? parseFloat(singleSalePrice) : undefined,
        });
    };

    const handleSaveDraft = () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!title.trim()) {
            setErrorMessage("タイトルは必須です");
            return;
        }

        const mediaUrl = uploadedFileUrls.length > 0 ? uploadedFileUrls[0] : undefined;

        createContentMutation.mutate({
            title,
            content: body,
            visibility: "DRAFT",
            mediaUrl,
            isLocked: accessPermission === "plans" || accessPermission === "single_sale",
            requiredPlanId: accessPermission === "plans" ? selectedPlanId : undefined,
            singleSalePrice: accessPermission === "single_sale" && singleSalePrice ? parseFloat(singleSalePrice) : undefined,
        });
    };

    return (
        <main className="min-h-screen bg-white px-6 py-10 text-black lg:px-12">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-neutral-500">新しいコンテンツを作成</p>
                        <h1 className="text-3xl font-semibold">投稿を作成</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveDraft}
                            disabled={createContentMutation.isPending}
                            className="rounded-2xl border border-black/10 bg-white px-6 py-3 font-semibold text-black transition-all hover:border-black/40 disabled:opacity-50"
                        >
                            下書き保存
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={createContentMutation.isPending}
                            className="rounded-2xl border border-black bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-black/80 disabled:opacity-50"
                        >
                            {createContentMutation.isPending ? "送信中..." : "公開"}
                        </button>
                    </div>
                </header>

                {/* エラー・成功メッセージ */}
                {errorMessage && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                        {successMessage}
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
                    {/* メインコンテンツエリア */}
                    <section className="space-y-6">
                        {/* タイトル入力 */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-semibold text-neutral-700">
                                タイトル *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="投稿のタイトルを入力..."
                                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-base focus:border-black/40 focus:outline-none"
                            />
                        </div>

                        {/* 画像/動画アップロード */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">
                                画像・動画をアップロード
                            </label>
                            <label
                                htmlFor="file-upload"
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-colors ${isDragging
                                    ? "border-black bg-neutral-100"
                                    : "border-black/20 bg-neutral-50 hover:border-black/40 hover:bg-neutral-100"
                                    }`}
                            >
                                <div className="mb-4 text-6xl text-neutral-400">☁</div>
                                <p className="text-center text-sm text-neutral-600">
                                    ファイルをここにドラッグ または{" "}
                                    <span className="font-semibold text-black">参照</span>{" "}
                                    してアップロード
                                </p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*,video/mp4,video/quicktime,video/webm,video/x-matroska"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm font-semibold text-neutral-700">
                                        アップロード済み: {uploadedFiles.length}ファイル
                                    </p>
                                    {uploadedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
                                        >
                                            <span className="flex-1 truncate">{file.name}</span>
                                            <span className="text-xs text-neutral-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 本文入力 */}
                        <div className="space-y-2">
                            <label htmlFor="body" className="text-sm font-semibold text-neutral-700">
                                説明文
                            </label>
                            <textarea
                                id="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="投稿の内容を記入..."
                                rows={12}
                                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-base focus:border-black/40 focus:outline-none"
                            />
                        </div>
                    </section>

                    {/* 右サイドバー（設定パネル） */}
                    <aside className="space-y-6">
                        {/* 公開設定 */}
                        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                                公開設定
                            </h3>
                            <div className="space-y-3">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        name="publish-mode"
                                        value="publish"
                                        checked={publishMode === "publish"}
                                        onChange={(e) => setPublishMode(e.target.value as PublishMode)}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm font-semibold">すぐに公開</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        name="publish-mode"
                                        value="draft"
                                        checked={publishMode === "draft"}
                                        onChange={(e) => setPublishMode(e.target.value as PublishMode)}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm font-semibold">下書きとして保存</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        name="publish-mode"
                                        value="scheduled"
                                        checked={publishMode === "scheduled"}
                                        onChange={(e) => setPublishMode(e.target.value as PublishMode)}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm font-semibold">予約投稿</span>
                                </label>

                                {publishMode === "scheduled" && (
                                    <div className="ml-7 space-y-3 border-l-2 border-black/10 pl-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-neutral-600">
                                                公開日
                                            </label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-black/40 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-neutral-600">
                                                公開時刻
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-black/40 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* アクセス権限 */}
                        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                                アクセス権限
                            </h3>
                            <div className="space-y-3">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        name="access"
                                        value="everyone"
                                        checked={accessPermission === "everyone"}
                                        onChange={(e) => setAccessPermission(e.target.value as "everyone" | "plans" | "single_sale")}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm font-semibold">全員（無料）</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        name="access"
                                        value="plans"
                                        checked={accessPermission === "plans"}
                                        onChange={(e) => setAccessPermission(e.target.value as "everyone" | "plans" | "single_sale")}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm font-semibold">プラン限定</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="radio"
                                        name="access"
                                        value="single_sale"
                                        checked={accessPermission === "single_sale"}
                                        onChange={(e) => setAccessPermission(e.target.value as "everyone" | "plans" | "single_sale")}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm font-semibold">単体販売</span>
                                </label>


                                {accessPermission === "plans" && (
                                    <div className="ml-7 space-y-2 border-l-2 border-black/10 pl-4">
                                        <select
                                            value={selectedPlanId}
                                            onChange={(e) => setSelectedPlanId(e.target.value)}
                                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-black/40 focus:outline-none"
                                            disabled={loadingPlans}
                                        >
                                            <option value="">
                                                {loadingPlans ? "読み込み中..." : "プランを選択..."}
                                            </option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name} - ¥{plan.price.toLocaleString()}/月
                                                </option>
                                            ))}
                                        </select>
                                        {plans.length === 0 && !loadingPlans && (
                                            <p className="text-xs text-neutral-500">
                                                プランが設定されていません
                                            </p>
                                        )}
                                    </div>
                                )}

                                {accessPermission === "single_sale" && (
                                    <div className="ml-7 space-y-2 border-l-2 border-black/10 pl-4">
                                        <label className="block">
                                            <span className="mb-1 block text-xs font-semibold text-neutral-600">
                                                販売価格
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-neutral-600">¥</span>
                                                <input
                                                    type="number"
                                                    value={singleSalePrice}
                                                    onChange={(e) => setSingleSalePrice(e.target.value)}
                                                    placeholder="例: 500"
                                                    min="0"
                                                    step="1"
                                                    className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-black/40 focus:outline-none"
                                                />
                                            </div>
                                        </label>
                                        <p className="text-xs text-neutral-500">
                                            このコンテンツを購入した人のみ閲覧できます
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
