"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { clsx } from "clsx";

// Schema without email
const accountSchema = z.object({
    displayName: z.string().min(1, "表示名は必須です"),
    bio: z.string().max(500, "自己紹介は500文字以内である必要があります").optional()
});

type AccountInput = z.infer<typeof accountSchema>;

export const PureLiteAccountForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<AccountInput>({
        resolver: zodResolver(accountSchema),
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
                        displayName: data.profile.displayName || "",
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

    const onSubmit = async (values: AccountInput) => {
        setMessage(null);
        try {
            const response = await fetch("/api/creators/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
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
        return <div className="mt-8 text-sm text-gray-600">読み込み中...</div>;
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-sm">
                表示名
                <input
                    type="text"
                    className={clsx(
                        "mt-2 w-full rounded-[18px] border px-4 py-3 text-sm",
                        errors.displayName ? "border-red-500" : "border-black/10"
                    )}
                    {...register("displayName")}
                />
                {errors.displayName && (
                    <p className="mt-1 text-xs text-red-500">{errors.displayName.message}</p>
                )}
            </label>

            <label className="block text-sm">
                自己紹介
                <textarea
                    rows={4}
                    className={clsx(
                        "mt-2 w-full rounded-[18px] border px-4 py-3 text-sm",
                        errors.bio ? "border-red-500" : "border-black/10"
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
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-green-200 bg-green-50 text-green-600"
                )}>
                    {message}
                </p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-[#7c5dfa] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {isSubmitting ? "保存中..." : "変更を保存"}
                </button>
            </div>
        </form>
    );
};
