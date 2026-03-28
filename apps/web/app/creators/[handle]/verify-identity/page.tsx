"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type DocumentType = "drivers_license" | "passport" | "mynumber_card";

export default function VerifyIdentityPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [documentType, setDocumentType] = useState<DocumentType>("drivers_license");
    const [frontImage, setFrontImage] = useState<File | null>(null);
    const [backImage, setBackImage] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string>("");
    const [backPreview, setBackPreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkList, setCheckList] = useState({
        fullVisible: false,
        readable: false,
        noReflection: false
    });
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

    const documentTypes = [
        { id: "drivers_license" as DocumentType, label: "運転免許証（表・裏）", needsBack: true },
        { id: "passport" as DocumentType, label: "パスポート", needsBack: false },
        { id: "mynumber_card" as DocumentType, label: "マイナンバーカード（表面のみ）", needsBack: false }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ファイルサイズチェック（10MB）
        if (file.size > 10 * 1024 * 1024) {
            alert("ファイルサイズは10MB以下にしてください");
            return;
        }

        // ファイルタイプチェック
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            alert("JPG、PNG、PDFファイルのみアップロード可能です");
            return;
        }

        if (side === "front") {
            setFrontImage(file);
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => setFrontPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setFrontPreview("");
            }
        } else {
            setBackImage(file);
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => setBackPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setBackPreview("");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!frontImage) {
            alert("表面の画像をアップロードしてください");
            return;
        }

        const selectedDoc = documentTypes.find(d => d.id === documentType);
        if (selectedDoc?.needsBack && !backImage) {
            alert("裏面の画像をアップロードしてください");
            return;
        }

        if (!checkList.fullVisible || !checkList.readable || !checkList.noReflection) {
            alert("すべてのチェック項目を確認してください");
            return;
        }

        if (!agreedToPrivacy) {
            alert("個人情報の取り扱いに同意してください");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("documentType", documentType);
            formData.append("frontImage", frontImage);
            if (backImage) formData.append("backImage", backImage);

            const response = await fetch("/api/creators/identity-verification/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("アップロードに失敗しました");
            }

            alert("本人確認書類を提出しました。審査完了までお待ちください。");
            // リセット
            setFrontImage(null);
            setBackImage(null);
            setFrontPreview("");
            setBackPreview("");
            setCheckList({ fullVisible: false, readable: false, noReflection: false });
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const needsBackImage = documentTypes.find(d => d.id === documentType)?.needsBack;

    if (status === "loading") {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-50">
                <p className="text-gray-500">読み込み中...</p>
            </main>
        );
    }

    if (!session) {
        router.push("/creators/login");
        return null;
    }

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">本人確認</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        クリエイターとして活動するために、本人確認書類の提出が必要です。
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 書類タイプ選択 */}
                    <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">書類タイプを選択</h2>
                        <div className="space-y-3">
                            {documentTypes.map((type) => (
                                <label
                                    key={type.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:bg-gray-50"
                                >
                                    <input
                                        type="radio"
                                        name="documentType"
                                        value={type.id}
                                        checked={documentType === type.id}
                                        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                                </label>
                            ))}
                        </div>

                        {documentType === "mynumber_card" && (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-red-900">重要な注意事項</p>
                                        <p className="mt-1 text-sm text-red-800">
                                            マイナンバーカードの場合は、<strong>裏面（個人番号が記載された面）は絶対にアップロードしないでください。</strong>
                                            表面のみをアップロードしてください。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ファイルアップロード */}
                    <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">書類画像のアップロード</h2>

                        {/* 表面 */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-semibold text-gray-900">
                                表面 <span className="text-red-600">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,application/pdf"
                                    onChange={(e) => handleFileChange(e, "front")}
                                    className="hidden"
                                    id="front-upload"
                                />
                                <label
                                    htmlFor="front-upload"
                                    className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-500 hover:bg-blue-50"
                                >
                                    {frontPreview ? (
                                        <img src={frontPreview} alt="表面プレビュー" className="max-h-[180px] rounded-lg" />
                                    ) : (
                                        <>
                                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-600">クリックしてファイルを選択</p>
                                            <p className="text-xs text-gray-500">JPG, PNG, PDF（最大10MB）</p>
                                        </>
                                    )}
                                </label>
                                {frontImage && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        選択中: {frontImage.name} ({(frontImage.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 裏面 */}
                        {needsBackImage && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-900">
                                    裏面 <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,application/pdf"
                                        onChange={(e) => handleFileChange(e, "back")}
                                        className="hidden"
                                        id="back-upload"
                                    />
                                    <label
                                        htmlFor="back-upload"
                                        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-500 hover:bg-blue-50"
                                    >
                                        {backPreview ? (
                                            <img src={backPreview} alt="裏面プレビュー" className="max-h-[180px] rounded-lg" />
                                        ) : (
                                            <>
                                                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-600">クリックしてファイルを選択</p>
                                                <p className="text-xs text-gray-500">JPG, PNG, PDF（最大10MB）</p>
                                            </>
                                        )}
                                    </label>
                                    {backImage && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            選択中: {backImage.name} ({(backImage.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* チェックリスト */}
                    <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">撮影チェックリスト</h2>
                        <p className="mb-4 text-sm text-gray-600">
                            アップロードする前に、以下の項目を確認してください。
                        </p>
                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={checkList.fullVisible}
                                    onChange={(e) => setCheckList({ ...checkList, fullVisible: e.target.checked })}
                                    className="mt-1 h-4 w-4 rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-900">書類の全体が写っているか（四隅まで含む）</span>
                            </label>
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={checkList.readable}
                                    onChange={(e) => setCheckList({ ...checkList, readable: e.target.checked })}
                                    className="mt-1 h-4 w-4 rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-900">文字がはっきり読み取れるか（ブレやピンボケがない）</span>
                            </label>
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={checkList.noReflection}
                                    onChange={(e) => setCheckList({ ...checkList, noReflection: e.target.checked })}
                                    className="mt-1 h-4 w-4 rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-900">光の反射がないか（フラッシュによる白飛びなど）</span>
                            </label>
                        </div>
                    </section>

                    {/* 個人情報の取り扱い */}
                    <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">個人情報の取り扱いについて</h2>
                        <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-700 space-y-3">
                            <p><strong>1. 利用目的</strong><br />
                            提出いただいた本人確認書類は、クリエイターとしての本人確認（身元の確認）のみに使用します。</p>
                            <p><strong>2. 保管・削除</strong><br />
                            書類画像は暗号化された安全なストレージに保管します。保管期間はアカウント存続中および退会後1年間とし、期間経過後に削除します。</p>
                            <p><strong>3. 第三者提供</strong><br />
                            法令に基づく場合を除き、提出された書類を第三者に提供・開示することはありません。</p>
                            <p><strong>4. 閲覧権限</strong><br />
                            書類を閲覧できるのは、本人確認審査を担当する運営スタッフのみに限定しています。</p>
                        </div>
                        <label className="mt-4 flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={agreedToPrivacy}
                                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded text-blue-600"
                            />
                            <span className="text-sm text-gray-900">
                                上記の個人情報の取り扱いに同意します
                            </span>
                        </label>
                    </section>

                    {/* 提出ボタン */}
                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !agreedToPrivacy}
                            className="px-8 py-3"
                        >
                            {isSubmitting ? "提出中..." : "本人確認書類を提出"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
