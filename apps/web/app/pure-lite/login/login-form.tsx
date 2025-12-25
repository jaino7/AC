"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    CreatorLoginInput,
    creatorLoginSchema
} from "@/lib/validators/creator-login";
import { clsx } from "clsx";

export const PureLiteLoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CreatorLoginInput>({
        resolver: zodResolver(creatorLoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (values: CreatorLoginInput) => {
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: "/pure-lite"
            });

            if (!result) {
                throw new Error("メールアドレスでのログインに失敗しました。");
            }

            if (result.error) {
                throw new Error("メールアドレスまたはパスワードが正しくありません。");
            }

            return result;
        },
        onSuccess: (result) => {
            setMessage("ログインに成功しました。");
            router.push(result?.url ?? "/pure-lite");
        }
    });

    const onSubmit = async (values: CreatorLoginInput) => {
        setMessage(null);
        try {
            await mutation.mutateAsync(values);
        } catch (error) {
            setMessage((error as Error).message);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/pure-lite" })}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
                <img src="/web_neutral_rd_na@3x.png" alt="Google" className="h-5 w-5" />
                Googleで続行
            </button>

            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                <span>または</span>
                <div className="h-px flex-1 bg-gray-200" />
            </div>

            <label className="block text-sm">
                メールアドレス
                <input
                    type="email"
                    placeholder="you@example.com"
                    className={clsx(
                        "mt-2 w-full rounded-xl border px-4 py-3 text-sm placeholder:text-[#b8b8c4]",
                        errors.email ? "border-red-500" : "border-black/10"
                    )}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
            </label>

            <label className="block text-sm">
                パスワード
                <input
                    type="password"
                    placeholder="パスワード"
                    className={clsx(
                        "mt-2 w-full rounded-xl border px-4 py-3 text-sm placeholder:text-[#b8b8c4]",
                        errors.password ? "border-red-500" : "border-black/10"
                    )}
                    {...register("password")}
                />
                {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
            </label>

            <div className="text-right text-xs text-[#7c5dfa]">
                <a href="#">パスワードを忘れた？</a>
            </div>

            {message && (
                <p
                    className={clsx(
                        "rounded-2xl border px-4 py-3 text-sm",
                        mutation.isError
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "border-green-200 bg-green-50 text-green-600"
                    )}
                >
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full rounded-2xl bg-[#7c5dfa] py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {mutation.isPending ? "続行中..." : "続行"}
            </button>
        </form>
    );
};
