"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
    CreatorAccountInput,
    creatorAccountSchema
} from "@/lib/validators/creator-account";
import { clsx } from "clsx";

export const ZineLiteAccountForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<CreatorAccountInput>({
        resolver: zodResolver(creatorAccountSchema),
        defaultValues: {
            username: "user-name",
            email: "user.name@example.com",
            bio: "A short description about the creator."
        }
    });

    const [message, setMessage] = useState<string | null>(null);

    const onSubmit = async (values: CreatorAccountInput) => {
        setMessage(null);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(values);
        setMessage("変更を保存しました。");
    };

    return (
        <form className="space-y-6 text-sm" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                    ユーザー名
                    <input
                        type="text"
                        className={clsx(
                            "mt-2 w-full rounded-[18px] border bg-[#0a0a0a] px-4 py-3 text-white",
                            errors.username ? "border-red-500" : "border-white/20"
                        )}
                        {...register("username")}
                    />
                    {errors.username && (
                        <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                    )}
                </label>
            </div>
            <label className="block">
                自己紹介
                <textarea
                    rows={4}
                    className={clsx(
                        "mt-2 w-full rounded-[18px] border bg-[#0a0a0a] px-4 py-3 text-white",
                        errors.bio ? "border-red-500" : "border-white/20"
                    )}
                    {...register("bio")}
                />
                {errors.bio && (
                    <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
                )}
            </label>

            {message && (
                <p className="rounded-2xl border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    {message}
                </p>
            )}

            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-green-500 px-6 py-2 font-semibold text-black disabled:opacity-50"
                >
                    {isSubmitting ? "保存中..." : "変更を保存"}
                </button>
            </div>
        </form>
    );
};
