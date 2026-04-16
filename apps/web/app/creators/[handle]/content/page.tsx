"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


interface Post {
  id: string;
  title: string;
  content: string | null;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
  visibility: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

const PostBadge = ({ text }: { text: string }) => (
  <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">
    {text}
  </span>
);

type ViewMode = "grid" | "list";

const PLAN_LABELS: Record<string, string> = {
  FREE: "フリー",
  LITE: "Lite",
  BUSINESS: "Business",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function StorageUsage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["storage"],
    queryFn: async () => {
      const res = await fetch("/api/creators/storage");
      if (!res.ok) throw new Error("Failed to fetch storage");
      return res.json() as Promise<{
        usedBytes: number;
        limitBytes: number;
        storagePlan: string;
      }>;
    },
    retry: 1,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2 pt-4 border-t border-black/10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">ストレージ</p>
        <div className="h-2 w-full rounded-full bg-neutral-100 animate-pulse" />
        <p className="text-xs text-neutral-400">読み込み中...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-2 pt-4 border-t border-black/10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">ストレージ</p>
        <div className="h-2 w-full rounded-full bg-neutral-100" />
        <p className="text-xs text-neutral-400">取得できませんでした</p>
      </div>
    );
  }

  const { usedBytes, limitBytes, storagePlan } = data;
  const usagePercent = limitBytes > 0 ? Math.min((usedBytes / limitBytes) * 100, 100) : 0;
  const isOverLimit = usedBytes >= limitBytes;

  const barColor = isOverLimit
    ? "bg-red-500"
    : usagePercent > 80
      ? "bg-amber-500"
      : "bg-blue-500";

  return (
    <div className="space-y-2 pt-4 border-t border-black/10">
      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
      <p className="text-xs text-neutral-600">
        {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
      </p>
      {isOverLimit && (
        <p className="text-xs text-red-500 font-medium">
          容量上限に達しています
        </p>
      )}
    </div>
  );
}

export default function ContentPage() {
  const queryClient = useQueryClient();
  const { handle } = useParams<{ handle: string }>();
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState<"all" | "public" | "draft">("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "free" | "plan" | "single">("all");

  // アコーディオン・スマホメニュー状態
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 一括選択・削除
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch posts with filters
  const { data: postsData, isLoading: loadingPosts } = useQuery({
    queryKey: ["posts", searchQuery, selectedVisibility, selectedTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedVisibility === "public") params.append("visibility", "PUBLIC");
      if (selectedVisibility === "draft") params.append("visibility", "DRAFT");
      if (selectedTypeFilter !== "all") params.append("type", selectedTypeFilter);

      const res = await fetch(`/api/creators/content?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const posts: Post[] = postsData?.posts || [];

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (postIds: string[]) => {
      const res = await fetch("/api/creators/content/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds }),
      });
      if (!res.ok) throw new Error("Failed to delete posts");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setSelectedPostIds([]);
      setShowDeleteModal(false);
    },
  });

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedPostIds.length === posts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(posts.map(p => p.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedPostIds.length > 0) {
      bulkDeleteMutation.mutate(selectedPostIds);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      // Add a small delay to prevent immediate closure when opening the menu
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  // Single post actions
  const togglePublishMutation = useMutation({
    mutationFn: async ({ postId, visibility }: { postId: string; visibility: string }) => {
      const res = await fetch(`/api/creators/content/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      if (!res.ok) throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpenMenuId(null);
    },
  });

  const deleteSingleMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/creators/content/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpenMenuId(null);
      setPostToDelete(null);
    },
  });

  return (
    <main className="min-h-screen bg-white px-0 py-6 text-black lg:px-12 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
        <aside className="h-fit rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.05)] lg:rounded-3xl lg:p-6">
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex w-full items-center justify-between text-sm font-semibold text-neutral-800"
            >
              <span>フィルター・メニュー</span>
              <span
                className={`transition-transform duration-200 ${isMobileMenuOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
          </div>

          <nav
            className={`mt-4 space-y-6 text-sm font-semibold lg:mt-0 lg:block ${isMobileMenuOpen ? "block" : "hidden"
              }`}
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">投稿</p>
              <button
                onClick={() => setSelectedVisibility("all")}
                className={`w-full rounded-2xl border px-4 py-2.5 text-left transition-colors lg:py-3 ${selectedVisibility === "all"
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/40"
                  }`}
              >
                すべての投稿
              </button>
              <button
                onClick={() => setSelectedVisibility("public")}
                className={`w-full rounded-2xl border px-4 py-2.5 text-left transition-colors lg:py-3 ${selectedVisibility === "public"
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/40"
                  }`}
              >
                公開中
              </button>
              <button
                onClick={() => setSelectedVisibility("draft")}
                className={`w-full rounded-2xl border px-4 py-2.5 text-left transition-colors lg:py-3 ${selectedVisibility === "draft"
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/40"
                  }`}
              >
                下書き
              </button>
            </div>



            {/* ストレージ使用量 */}
            <StorageUsage />
          </nav>
        </aside>

        <section className="space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold">投稿一覧</h1>
              </div>
              <div className="flex gap-3">
                {selectedPostIds.length > 0 && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="rounded-2xl border border-red-600 bg-red-600 px-4 py-3 text-white hover:bg-red-700 transition-colors font-semibold"
                  >
                    🗑 {selectedPostIds.length}件を削除
                  </button>
                )}
                <Link
                  href="content/new"
                  className="rounded-2xl border border-black bg-black px-4 py-3 text-white hover:bg-black/80 transition-colors"
                >
                  ＋ 新規投稿
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {posts.length > 0 && (
                <label className="flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold cursor-pointer hover:border-black/40">
                  <input
                    type="checkbox"
                    checked={selectedPostIds.length === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 cursor-pointer"
                  />
                  すべて選択
                </label>
              )}
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/10 px-4 py-3">
                <span className="text-neutral-400">🔍</span>
                <input
                  type="text"
                  placeholder="タイトルで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                />
              </div>
              <button className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold">
                新着順
              </button>
            </div>

            {/* コンテンツ種別フィルター */}
            <div className="flex gap-2 pb-2 overflow-x-auto">
              <button
                onClick={() => setSelectedTypeFilter("all")}
                className={`flex-shrink-0 rounded-2xl border px-5 py-2 text-sm font-semibold transition-colors ${selectedTypeFilter === "all"
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black hover:border-black/40"
                  }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedTypeFilter("free")}
                className={`flex-shrink-0 rounded-2xl border px-5 py-2 text-sm font-semibold transition-colors ${selectedTypeFilter === "free"
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black hover:border-black/40"
                  }`}
              >
                無料
              </button>
              <button
                onClick={() => setSelectedTypeFilter("plan")}
                className={`flex-shrink-0 rounded-2xl border px-5 py-2 text-sm font-semibold transition-colors ${selectedTypeFilter === "plan"
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black hover:border-black/40"
                  }`}
              >
                プラン限定
              </button>
              <button
                onClick={() => setSelectedTypeFilter("single")}
                className={`flex-shrink-0 rounded-2xl border px-5 py-2 text-sm font-semibold transition-colors ${selectedTypeFilter === "single"
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black hover:border-black/40"
                  }`}
              >
                単体販売
              </button>
            </div>
          </header>

          {loadingPosts ? (
            <div className="text-center py-12 text-neutral-500">読み込み中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              投稿がありません。
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_25px_60px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] relative"
                >
                  <input
                    type="checkbox"
                    checked={selectedPostIds.includes(post.id)}
                    onChange={() => handleSelectPost(post.id)}
                    className="absolute top-6 left-6 h-5 w-5 cursor-pointer z-10"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === post.id ? null : post.id);
                      }}
                      className="p-2 rounded-full hover:bg-neutral-100"
                    >
                      •••
                    </button>
                    {openMenuId === post.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 rounded-xl shadow-lg z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublishMutation.mutate({
                              postId: post.id,
                              visibility: post.visibility === "PUBLIC" ? "DRAFT" : "PUBLIC",
                            });
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-neutral-100 rounded-t-xl"
                        >
                          {post.visibility === "PUBLIC" ? "下書きに戻す" : "公開する"}
                        </button>
                        <Link
                          href={`content/${post.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-neutral-100"
                        >
                          編集
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}/${handle}/content/${post.id}`;
                            navigator.clipboard.writeText(shareUrl).then(() => {
                              setCopiedPostId(post.id);
                              setTimeout(() => setCopiedPostId(null), 2000);
                            });
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-neutral-100"
                        >
                          {copiedPostId === post.id ? "コピーしました！" : "共有リンクを取得"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToDelete(post.id);
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                  <Link href={`content/${post.id}/edit`} className="block">
                    <div className="aspect-video overflow-hidden rounded-2xl border border-black/10 bg-neutral-100">
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-400">
                          画像なし
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-xs text-neutral-500">
                          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold">{post.title}</h2>
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {post.content || "説明なし"}
                      </p>


                      <div className="pt-2">
                        <span className={`text-sm font-semibold ${post.visibility === "PUBLIC" ? "text-green-600" : "text-amber-600"
                          }`}>
                          {post.visibility === "PUBLIC" ? "公開中" : post.visibility === "DRAFT" ? "下書き" : "限定公開"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>


      {/* Single Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-3xl bg-white p-8 shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">投稿を削除</h2>
            <p className="mb-6 text-neutral-600">
              この投稿を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPostToDelete(null)}
                className="rounded-2xl border border-black/10 px-6 py-3 font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={() => deleteSingleMutation.mutate(postToDelete)}
                disabled={deleteSingleMutation.isPending}
                className="rounded-2xl border border-red-600 bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteSingleMutation.isPending ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-3xl bg-white p-8 shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">投稿を削除</h2>
            <p className="mb-6 text-neutral-600">
              選択した{selectedPostIds.length}件の投稿を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-2xl border border-black/10 px-6 py-3 font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="rounded-2xl border border-red-600 bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleteMutation.isPending ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
