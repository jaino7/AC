"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
    CreatorAccountInput,
    creatorAccountSchema
} from "@/lib/validators/creator-account";
import { clsx } from "clsx";

export const CreatorProAccountForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CreatorAccountInput>({
        resolver: zodResolver(creatorAccountSchema),
    });

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/creators/profile");
                if (response.ok) {
                    const data = await response.json();
                    reset({
                        username: data.profile.displayName || "",
                        email: data.profile.user?.email || "",
                        bio: data.profile.bio || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [reset]);

    const onSubmit = async (values: CreatorAccountInput) => {
        setMessage(null);
        try {
            const response = await fetch("/api/creators/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    displayName: values.username,
                    bio: values.bio
                }),
            });

            if (response.ok) {
                setMessage("プロフィールを更新しました。");
            } else {
                const error = await response.json();
                setMessage(error.error || "更新に失敗しました。");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            setMessage("更新に失敗しました。");
        }
    };

    if (isLoading) {
        return <div className="text-sm text-white/50">読み込み中...</div>;
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-sm text-white/70">
                ニックネーム
                <input
                    type="text"
                    className={clsx(
                        "mt-2 w-full rounded-2xl border bg-[#0c1621] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none",
                        errors.username ? "border-red-500" : "border-white/10"
                    )}
                    {...register("username")}
                />
                {errors.username && (
                    <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
                )}
            </label>

            <label className="block text-sm text-white/70">
                メールアドレス
                <input
                    type="email"
                    disabled
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0c1621]/50 px-4 py-3 text-white/50 cursor-not-allowed"
                    {...register("email")}
                />
                <p className="mt-1 text-xs text-white/40">メールアドレスは変更できません</p>
            </label>

            <label className="block text-sm text-white/70">
                自己紹介
                <textarea
                    rows={4}
                    className={clsx(
                        "mt-2 w-full rounded-2xl border bg-[#0c1621] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none",
                        errors.bio ? "border-red-500" : "border-white/10"
                    )}
                    {...register("bio")}
                />
                {errors.bio && (
                    <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>
                )}
            </label>

            {message && (
                <p className={clsx(
                    "rounded-2xl border px-4 py-3 text-sm",
                    message.includes("失敗")
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                )}>
                    {message}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-cyan-400 px-6 py-2 text-sm font-semibold text-[#03131c] hover:bg-cyan-300 disabled:opacity-50"
                >
                    {isSubmitting ? "保存中" : "保存する"}
                </button>
            </div>
        </form>
    );
};
