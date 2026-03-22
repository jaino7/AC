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

    // サムネイル用state
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

    // サンプルメディア用state（誰でも閲覧可能）
    const [sampleFiles, setSampleFiles] = useState<File[]>([]);
    const [sampleUrls, setSampleUrls] = useState<string[]>([]);
    const [sampleDurations, setSampleDurations] = useState<(number | null)[]>([]); // 動画の長さ（秒）
    const [uploadingSamples, setUploadingSamples] = useState(false);
    const [isDraggingSample, setIsDraggingSample] = useState(false);

    // 限定コンテンツ用state
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
    const [uploadedDurations, setUploadedDurations] = useState<(number | null)[]>([]); // 動画の長さ（秒）
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

    // アダルトコンテンツ設定
    const [isAdultContent, setIsAdultContent] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<string>("NONE");
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 未保存の変更があるかどうか
    const hasUnsavedChanges = !isSubmitted && (
        title.trim() !== "" ||
        body.trim() !== "" ||
        thumbnailFile !== null ||
        sampleFiles.length > 0 ||
        uploadedFiles.length > 0
    );

    // confirmで離脱許可済みならbeforeunloadを抑制するフラグ
    const [isLeavingConfirmed, setIsLeavingConfirmed] = useState(false);

    // ブラウザのタブ閉じ・リロード時の警告
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges && !isLeavingConfirmed) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges, isLeavingConfirmed]);

    // ブラウザの戻る/進むボタン時の警告
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        // 戻るボタンを検知するため、履歴にダミーを追加
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            if (hasUnsavedChanges) {
                const confirmed = window.confirm("変更が保存されていません。このページを離れますか？");
                if (confirmed) {
                    setIsLeavingConfirmed(true);
                    window.history.back();
                } else {
                    window.history.pushState(null, "", window.location.href);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [hasUnsavedChanges]);

    // ページ内リンククリック時の警告
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
            // 外部リンク（target="_blank"等）は beforeunload で処理される
            if (anchor.target && anchor.target !== "_self") return;

            e.preventDefault();
            e.stopPropagation();
            const confirmed = window.confirm("変更が保存されていません。このページを離れますか？");
            if (confirmed) {
                setIsLeavingConfirmed(true);
                window.location.href = href;
            }
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [hasUnsavedChanges]);

    // プラン一覧を取得
    useEffect(() => {
        const fetchPlans = async () => {
            setLoadingPlans(true);
            try {
                const response = await fetch("/api/creators/subscription-plans");
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

    // 本人確認ステータスを取得
    useEffect(() => {
        const fetchVerificationStatus = async () => {
            try {
                const response = await fetch("/api/creators/identity-verification/status");
                if (response.ok) {
                    const data = await response.json();
                    setVerificationStatus(data.status);
                }
            } catch (error) {
                console.error("Failed to fetch verification status:", error);
            }
        };

        fetchVerificationStatus();
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

    // 動画の長さを取得するヘルパー関数
    const getVideoDuration = (file: File): Promise<number | null> => {
        return new Promise((resolve) => {
            if (!file.type.startsWith('video/')) {
                resolve(null);
                return;
            }

            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = Math.floor(video.duration);
                resolve(duration);
            };

            video.onerror = () => {
                resolve(null);
            };

            video.src = URL.createObjectURL(file);
        });
    };

    // サムネイルアップロード処理
    const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        await processThumbnail(file);
    };

    const processThumbnail = async (file: File) => {
        setThumbnailFile(file);
        setUploadingThumbnail(true);
        setErrorMessage(null);
        try {
            const url = await uploadFileToR2(file);
            setThumbnailUrl(url);
            setSuccessMessage("サムネイルをアップロードしました");
        } catch (error: any) {
            setErrorMessage(error.message || "サムネイルのアップロードに失敗しました");
            setThumbnailFile(null);
            setThumbnailUrl("");
        } finally {
            setUploadingThumbnail(false);
        }
    };

    const handleThumbnailDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingThumbnail(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await processThumbnail(files[0]);
        }
    };

    // サンプルメディアアップロード処理
    const handleSampleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        await processSamples(files);
    };

    const processSamples = async (files: File[]) => {
        setSampleFiles((prev) => [...prev, ...files]);
        setUploadingSamples(true);
        setErrorMessage(null);
        try {
            // ファイルアップロードと動画時間取得を並行実行
            const uploadPromises = files.map((file) => uploadFileToR2(file));
            const durationPromises = files.map((file) => getVideoDuration(file));

            const [urls, durations] = await Promise.all([
                Promise.all(uploadPromises),
                Promise.all(durationPromises)
            ]);

            setSampleUrls((prev) => [...prev, ...urls]);
            setSampleDurations((prev) => [...prev, ...durations]);
            setSuccessMessage(`${files.length}件のサンプルをアップロードしました`);
        } catch (error: any) {
            setErrorMessage(error.message || "サンプルのアップロードに失敗しました");
        } finally {
            setUploadingSamples(false);
        }
    };

    const handleSampleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingSample(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await processSamples(files);
        }
    };

    const removeSample = (index: number) => {
        setSampleFiles((prev) => prev.filter((_, i) => i !== index));
        setSampleUrls((prev) => prev.filter((_, i) => i !== index));
        setSampleDurations((prev) => prev.filter((_, i) => i !== index));
    };

    // 限定コンテンツアップロード処理
    const processFiles = async (files: File[]) => {
        setUploadedFiles((prev) => [...prev, ...files]);
        setUploadingFiles(true);
        setErrorMessage(null);

        try {
            // ファイルアップロードと動画時間取得を並行実行
            const uploadPromises = files.map((file) => uploadFileToR2(file));
            const durationPromises = files.map((file) => getVideoDuration(file));

            const [urls, durations] = await Promise.all([
                Promise.all(uploadPromises),
                Promise.all(durationPromises)
            ]);

            setUploadedFileUrls((prev) => [...prev, ...urls]);
            setUploadedDurations((prev) => [...prev, ...durations]);
            setSuccessMessage(`${files.length}件のファイルをアップロードしました`);
        } catch (error: any) {
            setErrorMessage(error.message || "ファイルのアップロードに失敗しました");
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        await processFiles(files);
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

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
        setUploadedFileUrls((prev) => prev.filter((_, i) => i !== index));
        setUploadedDurations((prev) => prev.filter((_, i) => i !== index));
    };

    const createContentMutation = useMutation({
        mutationFn: async (data: {
            title: string;
            content: string;
            visibility: string;
            thumbnailUrl?: string;
            sampleMedia?: { url: string; duration: number | null }[];
            mainMedia?: { url: string; duration: number | null }[];
            isLocked: boolean;
            requiredPlanId?: string;
            singleSalePrice?: number;
            isAdultContent?: boolean;
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
            setIsSubmitted(true);
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

        // アダルトコンテンツチェック
        if (isAdultContent && verificationStatus !== "APPROVED") {
            setErrorMessage("アダルトコンテンツの投稿には本人確認が必要です。設定ページから本人確認を申請してください。");
            return;
        }

        let visibility = "PUBLIC";
        if (publishMode === "draft") {
            visibility = "DRAFT";
        } else if (publishMode === "scheduled") {
            visibility = "DRAFT";
        }

        createContentMutation.mutate({
            title,
            content: body,
            visibility,
            thumbnailUrl: thumbnailUrl || undefined,
            sampleMedia: sampleUrls.length > 0
                ? sampleUrls.map((url, i) => ({ url, duration: sampleDurations[i] }))
                : undefined,
            mainMedia: uploadedFileUrls.length > 0
                ? uploadedFileUrls.map((url, i) => ({ url, duration: uploadedDurations[i] }))
                : undefined,
            isLocked: accessPermission === "plans" || accessPermission === "single_sale",
            requiredPlanId: accessPermission === "plans" ? selectedPlanId : undefined,
            singleSalePrice: accessPermission === "single_sale" && singleSalePrice ? parseFloat(singleSalePrice) : undefined,
            isAdultContent,
        });
    };

    const handleSaveDraft = () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!title.trim()) {
            setErrorMessage("タイトルは必須です");
            return;
        }

        // アダルトコンテンツチェック
        if (isAdultContent && verificationStatus !== "APPROVED") {
            setErrorMessage("アダルトコンテンツの投稿には本人確認が必要です。設定ページから本人確認を申請してください。");
            return;
        }

        createContentMutation.mutate({
            title,
            content: body,
            visibility: "DRAFT",
            thumbnailUrl: thumbnailUrl || undefined,
            sampleMedia: sampleUrls.length > 0
                ? sampleUrls.map((url, i) => ({ url, duration: sampleDurations[i] }))
                : undefined,
            mainMedia: uploadedFileUrls.length > 0
                ? uploadedFileUrls.map((url, i) => ({ url, duration: uploadedDurations[i] }))
                : undefined,
            isLocked: accessPermission === "plans" || accessPermission === "single_sale",
            requiredPlanId: accessPermission === "plans" ? selectedPlanId : undefined,
            singleSalePrice: accessPermission === "single_sale" && singleSalePrice ? parseFloat(singleSalePrice) : undefined,
            isAdultContent,
        });
    };

    // ドラッグイベントハンドラー共通化
    const createDragHandlers = (setDragging: (v: boolean) => void) => ({
        onDragOver: (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setDragging(true); },
        onDragEnter: (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setDragging(true); },
        onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setDragging(false); },
    });

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

                        {/* サムネイル */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">
                                サムネイル画像
                            </label>
                            {thumbnailUrl ? (
                                <div className="relative rounded-2xl border border-black/10 overflow-hidden">
                                    <img src={thumbnailUrl} alt="サムネイル" className="w-full h-48 object-cover" />
                                    <button
                                        onClick={() => { setThumbnailFile(null); setThumbnailUrl(""); }}
                                        className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/80"
                                    >
                                        削除
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="thumbnail-upload"
                                    {...createDragHandlers(setIsDraggingThumbnail)}
                                    onDrop={handleThumbnailDrop}
                                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${isDraggingThumbnail
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-black/20 bg-neutral-50 hover:border-black/40 hover:bg-neutral-100"
                                        }`}
                                >
                                    <p className="text-center text-sm text-neutral-600">
                                        {uploadingThumbnail ? "アップロード中..." : "サムネイル画像を選択"}
                                    </p>
                                    <input
                                        id="thumbnail-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* サンプルメディア */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">
                                サンプル（プレビュー）
                            </label>
                            <label
                                htmlFor="sample-upload"
                                {...createDragHandlers(setIsDraggingSample)}
                                onDrop={handleSampleDrop}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${isDraggingSample
                                    ? "border-green-500 bg-green-50"
                                    : "border-black/20 bg-neutral-50 hover:border-black/40 hover:bg-neutral-100"
                                    }`}
                            >
                                <p className="text-center text-sm text-neutral-600">
                                    {uploadingSamples ? "アップロード中..." : "サンプル画像・動画を選択"}
                                </p>
                                <input
                                    id="sample-upload"
                                    type="file"
                                    accept="image/*,video/mp4,video/quicktime,video/webm,video/x-matroska"
                                    multiple
                                    onChange={handleSampleSelect}
                                    className="hidden"
                                />
                            </label>
                            {sampleFiles.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm font-semibold text-neutral-700">
                                        サンプル: {sampleFiles.length}ファイル
                                    </p>
                                    <div className="space-y-3">
                                        {sampleFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="group relative overflow-hidden rounded-xl border border-green-200 bg-green-50"
                                            >
                                                {file.type.startsWith("image/") ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="aspect-video w-full object-cover"
                                                    />
                                                ) : file.type.startsWith("video/") ? (
                                                    <video
                                                        src={URL.createObjectURL(file)}
                                                        controls
                                                        playsInline
                                                        className="aspect-video w-full bg-black"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-video items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                                                        {file.name}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between px-3 py-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs text-neutral-700">{file.name}</p>
                                                        <p className="text-[10px] text-neutral-400">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeSample(index)}
                                                        className="ml-2 rounded-full px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        削除
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* コンテンツ */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">
                                コンテンツ
                            </label>
                            <label
                                htmlFor="file-upload"
                                {...createDragHandlers(setIsDragging)}
                                onDrop={handleDrop}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${isDragging
                                    ? "border-amber-500 bg-amber-50"
                                    : "border-black/20 bg-neutral-50 hover:border-black/40 hover:bg-neutral-100"
                                    }`}
                            >
                                <p className="text-center text-sm text-neutral-600">
                                    {uploadingFiles ? "アップロード中..." : "コンテンツを選択"}
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
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm font-semibold text-neutral-700">
                                        コンテンツ: {uploadedFiles.length}ファイル
                                    </p>
                                    <div className="space-y-3">
                                        {uploadedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="group relative overflow-hidden rounded-xl border border-amber-200 bg-amber-50"
                                            >
                                                {file.type.startsWith("image/") ? (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="aspect-video w-full object-cover"
                                                    />
                                                ) : file.type.startsWith("video/") ? (
                                                    <video
                                                        src={URL.createObjectURL(file)}
                                                        controls
                                                        playsInline
                                                        className="aspect-video w-full bg-black"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-video items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                                                        {file.name}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between px-3 py-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs text-neutral-700">{file.name}</p>
                                                        <p className="text-[10px] text-neutral-400">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="ml-2 rounded-full px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        削除
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                                rows={8}
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

                        {/* アダルトコンテンツ設定（本人確認済みでない場合のみ表示） */}
                        {verificationStatus !== "APPROVED" && (
                            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                                    コンテンツ区分
                                </h3>
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isAdultContent}
                                        onChange={(e) => setIsAdultContent(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-neutral-900">アダルトコンテンツ</span>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            18歳以上向けのコンテンツの場合はチェックしてください
                                        </p>
                                    </div>
                                </label>
                                {isAdultContent && verificationStatus !== "APPROVED" && (
                                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3">
                                        <div className="flex items-start gap-2">
                                            <span className="text-sm">⚠️</span>
                                            <div>
                                                <p className="text-xs font-semibold text-red-900">
                                                    本人確認が必要です
                                                </p>
                                                <p className="mt-1 text-xs text-red-800">
                                                    アダルトコンテンツの投稿には本人確認が必要です。
                                                </p>
                                                <a
                                                    href="/creators/verify-identity"
                                                    className="mt-2 inline-block text-xs font-semibold text-red-700 underline hover:text-red-900"
                                                >
                                                    本人確認を申請する →
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}
