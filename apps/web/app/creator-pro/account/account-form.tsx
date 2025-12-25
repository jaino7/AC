"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
    CreatorAccountInput,
    creatorAccountSchema
} from "@/lib/validators/creator-account";
import { clsx } from "clsx";

export const CreatorProAccountForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<CreatorAccountInput>({
        resolver: zodResolver(creatorAccountSchema),
        defaultValues: {
            username: "user-name",
            email: "user@email.com",
            bio: ""
        }
    });

    const [message, setMessage] = useState<string | null>(null);

    const onSubmit = async (values: CreatorAccountInput) => {
        setMessage(null);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(values);
        setMessage("プロフィールを更新しました。");
    };

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
                    className={clsx(
                        "mt-2 w-full rounded-2xl border bg-[#0c1621] px-4 py-3 text-white focus:border-cyan-300 focus:outline-none",
                        errors.email ? "border-red-500" : "border-white/10"
                    )}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
            </label>
            {message && (
                <p className="rounded-2xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400">
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
