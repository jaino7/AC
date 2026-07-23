"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type InquiryStatus = "UNREAD" | "READ" | "CLOSED";

interface Inquiry {
    id: string;
    fanName: string;
    fanEmail: string;
    message: string;
    fields: Record<string, string> | null;
    status: InquiryStatus;
    createdAt: string;
}

interface InquiriesResponse {
    inquiries: Inquiry[];
    total: number;
    unreadCount: number;
    page: number;
    totalPages: number;
}

const statusLabels: Record<InquiryStatus, string> = {
    UNREAD: "未読",
    READ: "既読",
    CLOSED: "対応済み",
};

const statusColors: Record<InquiryStatus, string> = {
    UNREAD: "bg-blue-100 text-blue-700",
    READ: "bg-gray-100 text-gray-600",
    CLOSED: "bg-green-100 text-green-700",
};

export default function InquiriesContent() {
    const pathname = usePathname();
    const router = useRouter();
    const handle = pathname.split("/")[2];

    const [filter, setFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<InquiriesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Inquiry | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (filter !== "all") params.set("status", filter);
            const res = await fetch(`/api/creators/${handle}/inquiries?${params}`);
            if (res.ok) {
                setData(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [handle, filter, page]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const updateStatus = async (id: string, status: InquiryStatus) => {
        const res = await fetch(`/api/creators/${handle}/inquiries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            if (selected?.id === id) {
                setSelected(prev => prev ? { ...prev, status } : null);
            }
            fetchInquiries();
        }
    };

    const handleSelect = (inquiry: Inquiry) => {
        setSelected(inquiry);
        setShowDetail(true);
        if (inquiry.status === "UNREAD") {
            updateStatus(inquiry.id, "READ");
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] p-4 text-white sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold">お問い合わせ</h1>
                    {data && data.unreadCount > 0 && (
                        <p className="text-sm text-white/60 mt-1">
                            未読 <span className="text-blue-400 font-semibold">{data.unreadCount}件</span>
                        </p>
                    )}
                </div>
                <Link
                    href={`/creators/${handle}/inquiries/settings`}
                    className="min-h-10 rounded-lg bg-white/10 px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-white/20"
                >
                    フォーム設定
                </Link>
            </div>

            {/* Filter tabs / モバイル詳細時は戻るボタン */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {showDetail && (
                    <button
                        onClick={() => setShowDetail(false)}
                        className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/15 md:hidden"
                    >
                        ← 一覧
                    </button>
                )}
                {!showDetail && [
                    { key: "all", label: "すべて" },
                    { key: "UNREAD", label: "未読" },
                    { key: "READ", label: "既読" },
                    { key: "CLOSED", label: "対応済み" },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setFilter(tab.key); setPage(1); setSelected(null); }}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            filter === tab.key
                                ? "bg-white text-[#1a1a1a]"
                                : "bg-white/10 text-white/70 hover:bg-white/15"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex h-[calc(100vh-190px)] min-w-0 gap-4 sm:h-[calc(100vh-200px)]">
                {/* List */}
                <div className={`${showDetail ? "hidden md:block" : "block"} w-full flex-shrink-0 space-y-2 overflow-y-auto md:w-80`}>
                    {loading ? (
                        <div className="text-white/40 text-sm p-4">読み込み中...</div>
                    ) : data?.inquiries.length === 0 ? (
                        <div className="text-white/40 text-sm p-4">お問い合わせはありません</div>
                    ) : (
                        data?.inquiries.map(inq => (
                            <button
                                key={inq.id}
                                onClick={() => handleSelect(inq)}
                                className={`w-full min-w-0 rounded-xl p-4 text-left transition-colors ${
                                    selected?.id === inq.id
                                        ? "bg-white/20"
                                        : "bg-white/5 hover:bg-white/10"
                                }`}
                            >
                                <div className="mb-1 flex min-w-0 items-start justify-between gap-2">
                                    <span className="min-w-0 truncate text-sm font-medium">{inq.fanName}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[inq.status]}`}>
                                        {statusLabels[inq.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-white/50 truncate">{inq.fanEmail}</p>
                                <p className="text-xs text-white/60 mt-1 line-clamp-2">{inq.message}</p>
                                <p className="text-xs text-white/30 mt-2">
                                    {new Date(inq.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </button>
                        ))
                    )}

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex gap-2 pt-2 pb-4">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 rounded bg-white/10 text-sm disabled:opacity-30"
                            >
                                前へ
                            </button>
                            <span className="px-3 py-1 text-sm text-white/60">
                                {page} / {data.totalPages}
                            </span>
                            <button
                                disabled={page >= data.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 rounded bg-white/10 text-sm disabled:opacity-30"
                            >
                                次へ
                            </button>
                        </div>
                    )}
                </div>

                {/* Detail */}
                <div className={`${showDetail ? "block" : "hidden md:block"} min-w-0 flex-1 overflow-y-auto`}>
                    {selected ? (
                        <div className="h-full rounded-2xl bg-white/5 p-4 sm:p-6">
                            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold">{selected.fanName}</h2>
                                    <a
                                        href={`mailto:${selected.fanEmail}`}
                                        className="break-all text-sm text-blue-400 hover:underline"
                                    >
                                        {selected.fanEmail}
                                    </a>
                                    <p className="text-xs text-white/40 mt-1">
                                        {new Date(selected.createdAt).toLocaleString("ja-JP")}
                                    </p>
                                </div>
                                <span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs ${statusColors[selected.status]}`}>
                                    {statusLabels[selected.status]}
                                </span>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 mb-4">
                                <p className="text-sm text-white/50 mb-2 uppercase tracking-wide text-xs font-semibold">メッセージ</p>
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{selected.message}</p>
                            </div>

                            {selected.fields && Object.keys(selected.fields).length > 0 && (
                                <div className="bg-white/5 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-white/50 mb-3 uppercase tracking-wide text-xs font-semibold">追加情報</p>
                                    {Object.entries(selected.fields).map(([key, val]) => (
                                        <div key={key} className="mb-3">
                                            <p className="text-xs text-white/40 mb-1">{key}</p>
                                            <p className="text-sm">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 flex-wrap">
                                {selected.status !== "READ" && (
                                    <button
                                        onClick={() => updateStatus(selected.id, "READ")}
                                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
                                    >
                                        既読にする
                                    </button>
                                )}
                                {selected.status !== "CLOSED" && (
                                    <button
                                        onClick={() => updateStatus(selected.id, "CLOSED")}
                                        className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm transition-colors"
                                    >
                                        対応済みにする
                                    </button>
                                )}
                                {selected.status !== "UNREAD" && (
                                    <button
                                        onClick={() => updateStatus(selected.id, "UNREAD")}
                                        className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm transition-colors"
                                    >
                                        未読に戻す
                                    </button>
                                )}
                                <a
                                    href={`mailto:${selected.fanEmail}`}
                                    className="px-4 py-2 rounded-lg bg-white text-[#1a1a1a] hover:bg-white/90 text-sm font-medium transition-colors"
                                >
                                    返信する
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-white/30 text-sm">
                            左のリストからお問い合わせを選択してください
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
