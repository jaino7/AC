"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
    CreatorAccountInput,
    creatorAccountSchema
} from "@/lib/validators/creator-account";
import { clsx } from "clsx";

export const StudioProAccountForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<CreatorAccountInput>({
        resolver: zodResolver(creatorAccountSchema),
        defaultValues: {
            username: "John Doe",
            email: "john.doe@example.com",
            bio: "UI/UX Designer and front-end developer based in Tokyo. Passionate about creating clean, modern, and user-friendly web experiences."
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
                <p className="rounded-2xl border border-blue-500/50 bg-blue-500/10 px-4 py-3 text-sm text-blue-400">
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
