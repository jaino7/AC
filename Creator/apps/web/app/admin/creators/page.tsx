"use client";

import { useState, useEffect } from "react";

interface Creator {
  id: string;
  displayName: string;
  handle: string;
  email: string;
  createdAt: string;
  verificationStatus: string | null;
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [discordUrl, setDiscordUrl] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/creators")
      .then((res) => res.json())
      .then((data) => {
        setCreators(data.creators ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allSelected =
    creators.length > 0 && selectedIds.size === creators.length;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(creators.map((c) => c.id)));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyEmails() {
    const emails = creators
      .filter((c) => selectedIds.has(c.id))
      .map((c) => c.email)
      .join(", ");
    if (!emails) return;
    await navigator.clipboard.writeText(emails);
    setCopyMessage(`${selectedIds.size}件のメールアドレスをコピーしました`);
    setTimeout(() => setCopyMessage(""), 3000);
  }

  async function sendDiscordInvite() {
    if (!discordUrl.trim() || selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`${count}件のクリエイターに招待メールを送信しますか？`)) return;

    setSending(true);
    setCopyMessage("");
    try {
      const res = await fetch("/api/admin/creators/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorIds: Array.from(selectedIds),
          discordUrl: discordUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCopyMessage(`エラー: ${data.error}`);
      } else {
        setCopyMessage(
          `送信完了: 成功${data.success}件${data.failed > 0 ? `、失敗${data.failed}件` : ""}`
        );
      }
    } catch {
      setCopyMessage("送信中にエラーが発生しました");
    } finally {
      setSending(false);
      setTimeout(() => setCopyMessage(""), 5000);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function statusLabel(status: string | null) {
    switch (status) {
      case "APPROVED":
        return (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            承認済
          </span>
        );
      case "PENDING":
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
            審査中
          </span>
        );
      case "REJECTED":
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
            却下
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            未提出
          </span>
        );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        クリエイター一覧（{creators.length}件）
      </h2>

      {/* Actions Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <input
          type="text"
          placeholder="Discord招待URL"
          value={discordUrl}
          onChange={(e) => setDiscordUrl(e.target.value)}
          className="w-72 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={sendDiscordInvite}
          disabled={selectedIds.size === 0 || !discordUrl.trim() || sending}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {sending ? "送信中..." : "招待メールを送信"}
        </button>
        <button
          onClick={copyEmails}
          disabled={selectedIds.size === 0}
          className="rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          メールアドレスをコピー
        </button>
        {selectedIds.size > 0 && (
          <span className="text-sm text-gray-500">
            {selectedIds.size}件選択中
          </span>
        )}
        {copyMessage && (
          <span className="text-sm font-medium text-green-600">
            {copyMessage}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                名前
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                メール
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                ハンドル
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                登録日
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                本人確認
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {creators.map((c) => (
              <tr
                key={c.id}
                className={
                  selectedIds.has(c.id)
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {c.displayName}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">@{c.handle}</td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {statusLabel(c.verificationStatus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {creators.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            クリエイターが見つかりません
          </div>
        )}
      </div>
    </div>
  );
}
