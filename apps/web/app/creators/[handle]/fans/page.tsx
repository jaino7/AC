"use client";

import { useState, useEffect } from "react";

type Fan = {
    id: string;
    name: string;
    avatar: string;
    plan: "プランA" | "プランB";
    status: "支払い済み" | "期限切れ";
    hasTwitter: boolean;
    joined: string;
    nextRenewalDate: string; // 次回更新日（支払期限）
    bankAccountNumber: string; // 専用口座番号
    bankBranchName: string; // 支店名
};

const fans: Fan[] = [
    {
        id: "1",
        name: "Olivia Rhye",
        avatar: "https://i.pravatar.cc/40?img=1",
        plan: "プランA",
        status: "支払い済み",
        hasTwitter: false,
        joined: "2024/10/01",
        nextRenewalDate: "2025/01/15",
        bankAccountNumber: "1234567",
        bankBranchName: "東京支店"
    },
    {
        id: "2",
        name: "Phoenix Baker",
        avatar: "https://i.pravatar.cc/40?img=2",
        plan: "プランB",
        status: "期限切れ",
        hasTwitter: true,
        joined: "2024/09/15",
        nextRenewalDate: "2024/12/31",
        bankAccountNumber: "2345678",
        bankBranchName: "大阪支店"
    },
    {
        id: "3",
        name: "Lana Steiner",
        avatar: "https://i.pravatar.cc/40?img=3",
        plan: "プランA",
        status: "支払い済み",
        hasTwitter: false,
        joined: "2024/09/01",
        nextRenewalDate: "2025/01/20",
        bankAccountNumber: "3456789",
        bankBranchName: "横浜支店"
    },
    {
        id: "4",
        name: "Demi Wilkinson",
        avatar: "https://i.pravatar.cc/40?img=4",
        plan: "プランB",
        status: "期限切れ",
        hasTwitter: false,
        joined: "2024/08/20",
        nextRenewalDate: "2024/12/25",
        bankAccountNumber: "4567890",
        bankBranchName: "名古屋支店"
    }
];

export default function FanManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("全て");
    const [planFilter, setPlanFilter] = useState("全て");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // 外部クリックでメニューを閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // メニューボタンまたはメニュー内のクリックでない場合は閉じる
            if (openMenuId && !target.closest('.menu-container')) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    return (
        <main className="min-h-screen bg-white px-6 py-10 text-black lg:px-12">
            <div className="space-y-8">
                {/* ページヘッダー */}
                <header>
                    <h1 className="text-3xl font-semibold">ファン管理</h1>
                </header>

                {/* 検索・フィルター */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/10 px-4 py-3">
                        <span className="text-neutral-400">🔍</span>
                        <input
                            type="text"
                            placeholder="名前またはメールアドレスで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold focus:outline-none"
                    >
                        <option value="全て">ステータス: 全て</option>
                        <option value="支払い済み">支払い済み</option>
                        <option value="期限切れ">期限切れ</option>
                    </select>
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold focus:outline-none"
                    >
                        <option value="全て">プラン: 全て</option>
                        <option value="プランA">プランA</option>
                        <option value="プランB">プランB</option>
                    </select>
                </div>

                {/* ファンリストテーブル */}
                <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-black/10 bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        ユーザー
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        現在のプラン
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        ステータス
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        参加日
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        次回更新日（支払期限）
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">

                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/10">
                                {fans.map((fan) => (
                                    <tr key={fan.id} className="transition-colors hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={fan.avatar}
                                                    alt={fan.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{fan.name}</span>
                                                    {fan.hasTwitter && <span className="text-blue-400">🐦</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${fan.plan === "プランA"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {fan.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${fan.status === "支払い済み"
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                        }`}
                                                />
                                                <span className="text-sm">{fan.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {fan.joined}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {fan.nextRenewalDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative menu-container">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === fan.id ? null : fan.id)}
                                                    className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                                                >
                                                    ...
                                                </button>
                                                {openMenuId === fan.id && (
                                                    <div className="absolute right-0 top-full z-10 mt-1 w-64 rounded-2xl border border-black/10 bg-white shadow-lg">
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${fan.bankBranchName} ${fan.bankAccountNumber}`);
                                                                alert(`口座番号をコピーしました:\n${fan.bankBranchName}\n${fan.bankAccountNumber}`);
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-neutral-50"
                                                        >
                                                            📋 口座番号をコピー
                                                        </button>
                                                        <button
                                                            onClick={() => alert(`【専用口座情報】\n支店名: ${fan.bankBranchName}\n口座番号: ${fan.bankAccountNumber}`)}
                                                            className="w-full px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-neutral-50"
                                                        >
                                                            🏦 口座情報確認
                                                        </button>
                                                        <div className="border-t border-black/10"></div>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`${fan.name}さんを手動で入金済みにしますか？`)) {
                                                                    alert('入金済みに更新しました');
                                                                    setOpenMenuId(null);
                                                                }
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-sm font-semibold text-green-600 transition-colors hover:bg-neutral-50"
                                                        >
                                                            ✅ 手動で入金済みにする
                                                        </button>
                                                        <div className="border-t border-black/10"></div>
                                                        <button className="w-full px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-neutral-50">
                                                            詳細
                                                        </button>
                                                        <button className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-neutral-50">
                                                            このユーザーをブロックする
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ペジネーション */}
                    <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
                        <p className="text-sm text-neutral-600">
                            1/100
                        </p>
                        <div className="flex gap-2">
                            <button className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-black/40">
                                前へ
                            </button>
                            <button className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-black/40">
                                次へ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
