"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    FanSignupInput,
    fanSignupSchema
} from "@/lib/validators/fan-auth";
import { fanSignup } from "@/lib/api";
import { getCreatorHandleFromPath } from "@/lib/utils/creator";
import { clsx } from "clsx";
import Link from "next/link";

export const NeonProSignupForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FanSignupInput>({
        resolver: zodResolver(fanSignupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            displayName: "",
            acceptTerms: false as any,
            confirmAdult: false as any
        }
    });

    const router = useRouter();
    const pathname = usePathname();
    const [message, setMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (values: FanSignupInput) => {
            // URLからクリエイターハンドルを取得
            const creatorHandle = getCreatorHandleFromPath(pathname);
            if (!creatorHandle) {
                throw new Error("クリエイターが特定できませんでした");
            }

            await fanSignup({ ...values, creatorHandle });

            // Auto login after signup
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: "/neon-pro/content"
            });

            if (!result || result.error) {
                throw new Error("登録は成功しましたが、ログインに失敗しました。ログインページからお試しください。");
            }

            return result;
        },
        onSuccess: (result) => {
            setMessage("アカウントが作成されました！");
            router.push(result?.url ?? "/neon-pro/content");
        }
    });

    const onSubmit = async (values: FanSignupInput) => {
        setMessage(null);
        try {
            await mutation.mutateAsync(values);
        } catch (error) {
            setMessage((error as Error).message);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/neon-pro/content" })}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-[#0f1c3c] py-3 text-sm font-semibold text-white transition hover:bg-[#16254d] hover:border-cyan-400/50"
            >
                <img src="/web_neutral_rd_na@3x.png" alt="Google" className="h-5 w-5" />
                Googleで続行
            </button>

            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-cyan-500/40">
                <div className="h-px flex-1 bg-cyan-500/20" />
                <span>または</span>
                <div className="h-px flex-1 bg-cyan-500/20" />
            </div>

            <label className="block text-sm text-white/70">
                <span className="mb-1 block text-xs font-semibold text-white/60">表示名（任意）</span>
                <input
                    type="text"
                    placeholder="表示名"
                    className="w-full rounded-2xl border border-white/15 bg-[#0f1c3c] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none"
                    {...register("displayName")}
                />
            </label>

            <label className="block text-sm text-white/70">
                <span className="mb-1 block text-xs font-semibold text-white/60">メールアドレス</span>
                <input
                    type="email"
                    placeholder="fan@example.com"
                    className={clsx(
                        "w-full rounded-2xl border bg-[#0f1c3c] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none",
                        errors.email ? "border-red-500" : "border-white/15"
                    )}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
            </label>

            <label className="block text-sm text-white/70">
                <span className="mb-1 block text-xs font-semibold text-white/60">パスワード</span>
                <input
                    type="password"
                    placeholder="8文字以上"
                    className={clsx(
                        "w-full rounded-2xl border bg-[#0f1c3c] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none",
                        errors.password ? "border-red-500" : "border-white/15"
                    )}
                    {...register("password")}
                />
                {errors.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
            </label>

            <label className="block text-sm text-white/70">
                <span className="mb-1 block text-xs font-semibold text-white/60">パスワード（確認）</span>
                <input
                    type="password"
                    placeholder="もう一度入力"
                    className={clsx(
                        "w-full rounded-2xl border bg-[#0f1c3c] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none",
                        errors.confirmPassword ? "border-red-500" : "border-white/15"
                    )}
                    {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
            </label>

            <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-white/70">
                    <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0f1c3c] accent-cyan-400"
                        {...register("acceptTerms")}
                    />
                    <span>
                        <Link href="/terms" className="text-cyan-400 underline">利用規約</Link>
                        と
                        <Link href="/privacy" className="text-cyan-400 underline">プライバシーポリシー</Link>
                        に同意します
                    </span>
                </label>
                {errors.acceptTerms && (
                    <p className="text-xs text-red-400">{errors.acceptTerms.message}</p>
                )}

                <label className="flex items-start gap-3 text-sm text-white/70">
                    <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0f1c3c] accent-cyan-400"
                        {...register("confirmAdult")}
                    />
                    <span>私は18歳以上です</span>
                </label>
                {errors.confirmAdult && (
                    <p className="text-xs text-red-400">{errors.confirmAdult.message}</p>
                )}
            </div>

            {message && (
                <p
                    className={clsx(
                        "rounded-2xl border px-4 py-3 text-sm",
                        mutation.isError
                            ? "border-red-500/50 bg-red-500/10 text-red-400"
                            : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                    )}
                >
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full rounded-2xl bg-cyan-400 py-3 text-sm font-semibold text-[#041024] hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {mutation.isPending ? "アカウント作成中..." : "アカウントを作成"}
            </button>

            <p className="text-center text-sm text-white/60">
                すでにアカウントをお持ちですか？{" "}
                <Link href="/neon-pro/login" className="text-cyan-400 underline">
                    ログイン
                </Link>
            </p>
        </form>
    );
};
