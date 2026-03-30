"use client";

import { useState, useRef } from "react";

const CATEGORIES = [
    { value: "BUG", label: "問題・不具合", description: "動作しない、エラーが出るなど" },
    { value: "IMPROVEMENT", label: "改善", description: "既存機能をもっと使いやすくしたい" },
    { value: "FEATURE_REQUEST", label: "機能リクエスト", description: "新しく追加してほしい機能" },
];

export default function FeedbackContent() {
    const [category, setCategory] = useState("");
    const [body, setBody] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        const validFiles = newFiles.filter(
            (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
        );

        const combined = [...files, ...validFiles].slice(0, 5);
        setFiles(combined);

        const newPreviews = combined.map((f) => URL.createObjectURL(f));
        previews.forEach((p) => URL.revokeObjectURL(p));
        setPreviews(newPreviews);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !body.trim()) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("category", category);
            formData.append("body", body);
            files.forEach((f) => formData.append("files", f));

            const res = await fetch("/api/feedback", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setSubmitted(true);
                setCategory("");
                setBody("");
                previews.forEach((p) => URL.revokeObjectURL(p));
                setFiles([]);
                setPreviews([]);
            }
        } catch (error) {
            console.error("Failed to submit feedback:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-green-800">
                        フィードバックを送信しました
                    </h2>
                    <p className="mb-6 text-green-700">
                        貴重なご意見ありがとうございます。改善に役立てさせていただきます。
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                    >
                        別のフィードバックを送る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">フィードバック</h1>
                <p className="mt-2 text-sm text-gray-600">
                    問題の報告、改善のご提案、追加してほしい機能など、お気軽にお聞かせください。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        カテゴリ <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategory(cat.value)}
                                className={`rounded-lg border p-3 text-left transition-all ${
                                    category === cat.value
                                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                                <div className="mt-0.5 text-xs text-gray-500">{cat.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div>
                    <label htmlFor="feedback-body" className="mb-2 block text-sm font-medium text-gray-700">
                        内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="feedback-body"
                        rows={6}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="できるだけ具体的にお書きください。再現手順やご利用の環境なども添えていただけると助かります。"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        スクリーンショット
                    </label>
                    <p className="mb-3 text-xs text-gray-500">
                        スクリーンショットを添付していただくと、状況をより正確に把握できます。（最大5枚、各10MBまで）
                    </p>

                    {previews.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-3">
                            {previews.map((src, i) => (
                                <div key={i} className="group relative">
                                    <img
                                        src={src}
                                        alt={`Screenshot ${i + 1}`}
                                        className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {files.length < 5 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            画像を追加
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={!category || !body.trim() || submitting}
                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                        {submitting ? "送信中..." : "送信する"}
                    </button>
                </div>
            </form>
        </div>
    );
}
