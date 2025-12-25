"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { clsx } from "clsx";

// Schema without email
const accountSchema = z.object({
    username: z.string().min(3, "ユーザー名は3文字以上である必要があります"),
    bio: z.string().max(500, "自己紹介は500文字以内である必要があります").optional()
});

type AccountInput = z.infer<typeof accountSchema>;

export const PureLiteAccountForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<AccountInput>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            username: "クリエイター名",
            bio: "クリエイターとして活動しています。限定コンテンツをお楽しみください！✨"
        }
    });

    const [message, setMessage] = useState<string | null>(null);

    const onSubmit = async (values: AccountInput) => {
        setMessage(null);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(values);
        setMessage("プロフィールを更新しました。");
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-sm">
                ユーザー名
                <input
                    type="text"
                    className={clsx(
                        "mt-2 w-full rounded-[18px] border px-4 py-3 text-sm",
                        errors.username ? "border-red-500" : "border-black/10"
                    )}
                    {...register("username")}
                />
                {errors.username && (
                    <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
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
                <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
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
