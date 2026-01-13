"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
    CreatorAccountInput,
    creatorAccountSchema
} from "@/lib/validators/creator-account";
import { clsx } from "clsx";

export const StudioProAccountForm = () => {
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
                setMessage("変更を保存しました。");
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
        <form className="mt-8 space-y-6 text-sm" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
                ユーザー名
                <input
                    type="text"
                    className={clsx(
                        "mt-2 w-full rounded-[18px] border bg-[#091126] px-4 py-3 text-white",
                        errors.username ? "border-red-500" : "border-white/10"
                    )}
                    {...register("username")}
                />
                {errors.username && (
                    <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                )}
            </label>

            <label className="block">
                自己紹介
                <textarea
                    rows={4}
                    className={clsx(
                        "mt-2 w-full rounded-[18px] border bg-[#091126] px-4 py-3 text-white",
                        errors.bio ? "border-red-500" : "border-white/10"
                    )}
                    {...register("bio")}
                />
                {errors.bio && (
                    <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
                )}
            </label>

            {message && (
                <p className={clsx(
                    "rounded-2xl border px-4 py-3 text-sm",
                    message.includes("失敗")
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-blue-500/50 bg-blue-500/10 text-blue-400"
                )}>
                    {message}
                </p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-[#2f6dff] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {isSubmitting ? "保存中..." : "変更を保存"}
                </button>
            </div>
        </form>
    );
};
