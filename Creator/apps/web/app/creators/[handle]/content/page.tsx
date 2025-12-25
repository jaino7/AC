"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Folder {
  id: string;
  name: string;
  _count?: { posts: number };
}

interface Tag {
  id: string;
  name: string;
  _count?: { posts: number };
}

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
  folder?: { id: string; name: string } | null;
  tags?: { tag: { id: string; name: string } }[];
}

const PostBadge = ({ text }: { text: string }) => (
  <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">
    {text}
  </span>
);

type ViewMode = "grid" | "list";

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [selectedVisibility, setSelectedVisibility] = useState<"all" | "public" | "draft">("all");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  // 一括選択・削除
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch folders
  const { data: foldersData } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const res = await fetch("/api/creators/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
  });

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/creators/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    },
  });

  // Fetch posts with filters
  const { data: postsData, isLoading: loadingPosts } = useQuery({
    queryKey: ["posts", searchQuery, selectedFolderId, selectedTagId, selectedVisibility],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedFolderId) params.append("folderId", selectedFolderId);
      if (selectedTagId) params.append("tagId", selectedTagId);
      if (selectedVisibility === "public") params.append("visibility", "PUBLIC");
      if (selectedVisibility === "draft") params.append("visibility", "DRAFT");

      const res = await fetch(`/api/creators/content?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const folders: Folder[] = foldersData?.folders || [];
  const tags: Tag[] = tagsData?.tags || [];
  const posts: Post[] = postsData?.posts || [];

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/creators/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
      setShowNewFolderModal(false);
    },
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/creators/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setNewTagName("");
      setShowNewTagModal(false);
    },
  });

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
    },
  });

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <nav className="space-y-4 text-sm font-semibold">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">投稿</p>
              <button
                onClick={() => setSelectedVisibility("all")}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${selectedVisibility === "all"
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/40"
                  }`}
              >
                すべての投稿
              </button>
              <button
                onClick={() => setSelectedVisibility("public")}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${selectedVisibility === "public"
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/40"
                  }`}
              >
                公開中
              </button>
              <button
                onClick={() => setSelectedVisibility("draft")}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${selectedVisibility === "draft"
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/40"
                  }`}
              >
                下書き
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                <span>フォルダ</span>
                <span>▼</span>
              </div>
              <ul className="space-y-2 text-sm">
                {folders.map((folder) => (
                  <li
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id === selectedFolderId ? "" : folder.id)}
                    className={`cursor-pointer rounded-2xl border px-4 py-2 transition-colors ${selectedFolderId === folder.id
                      ? "border-black bg-black text-white"
                      : "border-black/10 hover:border-black/40"
                      }`}
                  >
                    {folder.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                <span>タグ</span>
                <span>▼</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    onClick={() => setSelectedTagId(tag.id === selectedTagId ? "" : tag.id)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${selectedTagId === tag.id
                      ? "border-black bg-black text-white"
                      : "border-black/10 hover:border-black/40"
                      }`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 font-semibold hover:border-black/40"
              >
                新規フォルダ
              </button>
              <button
                onClick={() => setShowNewTagModal(true)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 font-semibold hover:border-black/40"
              >
                新規タグ
              </button>
            </div>
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
                フィルター
              </button>
              <button className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold">
                新着順
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${viewMode === "grid"
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black"
                  }`}
              >
                ⊞ グリッド
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${viewMode === "list"
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black"
                  }`}
              >
                ☰ リスト
              </button>
            </div>
          </header>

          {loadingPosts ? (
            <div className="text-center py-12 text-neutral-500">読み込み中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              投稿がありません。新規投稿を作成してください。
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                            deleteSingleMutation.mutate(post.id);
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
                        {post.folder && <PostBadge text={post.folder.name} />}
                        <span className="text-xs text-neutral-500">
                          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold">{post.title}</h2>
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {post.content || "説明なし"}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {post.tags.map((tagItem) => (
                            <span
                              key={tagItem.tag.id}
                              className="rounded-full border border-black/10 px-2 py-0.5 text-xs"
                            >
                              {tagItem.tag.name}
                            </span>
                          ))}
                        </div>
                      )}

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
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex w-full gap-4 rounded-3xl border border-black/10 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] relative"
                >
                  <input
                    type="checkbox"
                    checked={selectedPostIds.includes(post.id)}
                    onChange={() => handleSelectPost(post.id)}
                    className="absolute top-4 left-4 h-5 w-5 cursor-pointer z-10"
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
                            deleteSingleMutation.mutate(post.id);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                  <Link href={`content/${post.id}/edit`} className="flex w-full gap-4 ml-8">
                    <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-neutral-100">
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xs">
                          画像なし
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.folder && <PostBadge text={post.folder.name} />}
                        <span className="text-xs text-neutral-500">
                          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold">{post.title}</h2>
                      <p className="text-sm text-neutral-600 line-clamp-1">
                        {post.content || "説明なし"}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center">
                      <span className={`text-sm font-semibold ${post.visibility === "PUBLIC" ? "text-green-600" : "text-amber-600"
                        }`}>
                        {post.visibility === "PUBLIC" ? "公開中" : post.visibility === "DRAFT" ? "下書き" : "限定公開"}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-3xl bg-white p-8 shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">新規フォルダ作成</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="フォルダ名を入力..."
              className="w-full rounded-2xl border border-black/10 px-4 py-3 mb-6 focus:border-black/40 focus:outline-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName("");
                }}
                className="rounded-2xl border border-black/10 px-6 py-3 font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={() => createFolderMutation.mutate(newFolderName)}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
                className="rounded-2xl border border-black bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {createFolderMutation.isPending ? "作成中..." : "作成"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Tag Modal */}
      {showNewTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-3xl bg-white p-8 shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">新規タグ作成</h2>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="タグ名を入力..."
              className="w-full rounded-2xl border border-black/10 px-4 py-3 mb-6 focus:border-black/40 focus:outline-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewTagModal(false);
                  setNewTagName("");
                }}
                className="rounded-2xl border border-black/10 px-6 py-3 font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={() => createTagMutation.mutate(newTagName)}
                disabled={!newTagName.trim() || createTagMutation.isPending}
                className="rounded-2xl border border-black bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {createTagMutation.isPending ? "作成中..." : "作成"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
