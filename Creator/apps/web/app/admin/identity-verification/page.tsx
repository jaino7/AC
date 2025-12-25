"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

type Verification = {
    id: string;
    creatorId: string;
    creatorName: string;
    documentType: string;
    status: VerificationStatus;
    submittedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
};

type RejectionReason = "blurry" | "expired" | "invalid" | "incomplete" | "other";

export default function IdentityVerificationAdminPage() {
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
    const [frontImageUrl, setFrontImageUrl] = useState("");
    const [backImageUrl, setBackImageUrl] = useState("");
    const [showImageModal, setShowImageModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState<RejectionReason>("blurry");
    const [customReason, setCustomReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const rejectionReasons = [
        { id: "blurry" as RejectionReason, label: "画像がぼやけている" },
        { id: "expired" as RejectionReason, label: "書類の有効期限が切れている" },
        { id: "invalid" as RejectionReason, label: "無効な書類" },
        { id: "incomplete" as RejectionReason, label: "書類の一部が欠けている" },
        { id: "other" as RejectionReason, label: "その他" }
    ];

    const documentTypeLabels: Record<string, string> = {
        DRIVERS_LICENSE: "運転免許証",
        PASSPORT: "パスポート",
        MYNUMBER_CARD: "マイナンバーカード"
    };

    const statusLabels: Record<VerificationStatus, string> = {
        PENDING: "審査待ち",
        APPROVED: "承認済み",
        REJECTED: "却下"
    };

    const statusColors: Record<VerificationStatus, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800"
    };

    useEffect(() => {
        loadVerifications();
    }, []);

    const loadVerifications = async () => {
        try {
            const response = await fetch("/api/admin/identity-verification/list");
            if (!response.ok) throw new Error("Failed to load verifications");
            const data = await response.json();
            setVerifications(data.verifications);
        } catch (error) {
            console.error(error);
            alert("申請一覧の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const loadImages = async (verification: Verification) => {
        try {
            // 表面画像の署名付きURL取得
            const frontResponse = await fetch(
                `/api/admin/identity-verification/${verification.id}/image?type=front`
            );
            if (frontResponse.ok) {
                const frontData = await frontResponse.json();
                setFrontImageUrl(frontData.signedUrl);
            }

            // 裏面画像の署名付きURL取得（運転免許証の場合のみ）
            if (verification.documentType === "DRIVERS_LICENSE") {
                const backResponse = await fetch(
                    `/api/admin/identity-verification/${verification.id}/image?type=back`
                );
                if (backResponse.ok) {
                    const backData = await backResponse.json();
                    setBackImageUrl(backData.signedUrl);
                }
            }

            setSelectedVerification(verification);
            setShowImageModal(true);
        } catch (error) {
            console.error(error);
            alert("画像の取得に失敗しました");
        }
    };

    const handleApprove = async (verificationId: string) => {
        if (!confirm("この申請を承認しますか？")) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`/api/admin/identity-verification/${verificationId}/approve`, {
                method: "POST"
            });

            if (!response.ok) throw new Error("Approval failed");

            alert("承認しました。クリエイターにメールを送信しました。");
            setShowImageModal(false);
            loadVerifications();
        } catch (error) {
            console.error(error);
            alert("承認に失敗しました");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedVerification) return;

        const reason = rejectionReason === "other" ? customReason : rejectionReason;
        if (!reason) {
            alert("却下理由を入力してください");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(
                `/api/admin/identity-verification/${selectedVerification.id}/reject`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason, customReason })
                }
            );

            if (!response.ok) throw new Error("Rejection failed");

            alert("却下しました。クリエイターに理由を通知しました。");
            setShowRejectModal(false);
            setShowImageModal(false);
            loadVerifications();
        } catch (error) {
            console.error(error);
            alert("却下に失敗しました");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">本人確認審査</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        クリエイターから提出された本人確認書類を審査します。
                    </p>
                </header>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">読み込み中...</p>
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="rounded-3xl border border-black/10 bg-white p-12 text-center shadow-sm">
                        <p className="text-gray-600">審査待ちの申請はありません</p>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">
                                            クリエイター名
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">
                                            書類タイプ
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">
                                            提出日時
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">
                                            ステータス
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">
                                            アクション
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {verifications.map((verification) => (
                                        <tr key={verification.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {verification.creatorName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {documentTypeLabels[verification.documentType] || verification.documentType}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(verification.submittedAt).toLocaleString("ja-JP")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[verification.status]
                                                        }`}
                                                >
                                                    {statusLabels[verification.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {verification.status === "PENDING" && (
                                                    <button
                                                        onClick={() => loadImages(verification)}
                                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                                    >
                                                        審査する
                                                    </button>
                                                )}
                                                {verification.status === "REJECTED" && verification.rejectionReason && (
                                                    <span className="text-xs text-red-600">
                                                        却下理由: {verification.rejectionReason}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 画像プレビューモーダル */}
                {showImageModal && selectedVerification && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    {selectedVerification.creatorName} - 本人確認書類
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowImageModal(false);
                                        setFrontImageUrl("");
                                        setBackImageUrl("");
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4 text-sm text-gray-600">
                                <p>書類タイプ: {documentTypeLabels[selectedVerification.documentType]}</p>
                                <p>提出日時: {new Date(selectedVerification.submittedAt).toLocaleString("ja-JP")}</p>
                                <p className="mt-2 rounded-lg bg-yellow-50 p-3 text-yellow-800">
                                    ⚠️ この画像URLは5分間のみ有効です。ページを離れると再度生成が必要です。
                                </p>
                            </div>

                            <div className="mb-6 space-y-4">
                                <div>
                                    <h3 className="mb-2 font-semibold text-gray-900">表面</h3>
                                    {frontImageUrl ? (
                                        <img
                                            src={frontImageUrl}
                                            alt="表面"
                                            className="w-full rounded-lg border border-gray-200"
                                        />
                                    ) : (
                                        <p className="text-gray-500">読み込み中...</p>
                                    )}
                                </div>

                                {selectedVerification.documentType === "DRIVERS_LICENSE" && (
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-900">裏面</h3>
                                        {backImageUrl ? (
                                            <img
                                                src={backImageUrl}
                                                alt="裏面"
                                                className="w-full rounded-lg border border-gray-200"
                                            />
                                        ) : (
                                            <p className="text-gray-500">読み込み中...</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={() => handleApprove(selectedVerification.id)}
                                    disabled={isProcessing}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isProcessing ? "処理中..." : "承認"}
                                </Button>
                                <Button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={isProcessing}
                                    variant="ghost"
                                    className="flex-1 border border-red-600 text-red-600 hover:bg-red-50"
                                >
                                    却下
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 却下理由モーダル */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-3xl bg-white p-8">
                            <h2 className="mb-6 text-2xl font-semibold text-gray-900">却下理由を選択</h2>

                            <div className="mb-6 space-y-3">
                                {rejectionReasons.map((reason) => (
                                    <label
                                        key={reason.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:bg-gray-50"
                                    >
                                        <input
                                            type="radio"
                                            name="rejectionReason"
                                            value={reason.id}
                                            checked={rejectionReason === reason.id}
                                            onChange={(e) => setRejectionReason(e.target.value as RejectionReason)}
                                            className="h-4 w-4 text-red-600"
                                        />
                                        <span className="text-sm font-medium text-gray-900">{reason.label}</span>
                                    </label>
                                ))}
                            </div>

                            {rejectionReason === "other" && (
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-semibold text-gray-900">
                                        却下理由を入力
                                    </label>
                                    <textarea
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        rows={4}
                                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="却下理由を詳しく入力してください"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleReject}
                                    disabled={isProcessing || (rejectionReason === "other" && !customReason)}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {isProcessing ? "処理中..." : "却下を確定"}
                                </Button>
                                <Button
                                    onClick={() => setShowRejectModal(false)}
                                    variant="ghost"
                                    className="flex-1"
                                >
                                    キャンセル
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
