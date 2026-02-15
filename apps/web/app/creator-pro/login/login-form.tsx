"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    CreatorLoginInput,
    creatorLoginSchema
} from "@/lib/validators/creator-login";
import { clsx } from "clsx";

interface CreatorProLoginFormProps {
    handle?: string;
}

export const CreatorProLoginForm = ({ handle: propHandle }: CreatorProLoginFormProps = {}) => {
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
    const searchParams = useSearchParams();
    const handle = propHandle || searchParams.get("handle");
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // ログイン後のリダイレクト先
    const callbackUrl = handle ? `/${handle}/content` : "/creators/dashboard";

    const mutation = useMutation({
        mutationFn: async (values: CreatorLoginInput) => {
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl
            });

            if (!result) {
                throw new Error("メールアドレスでのログインに失敗しました。");
            }

            if (result.error) {
                throw new Error("メールアドレスまたはパスワードが正しくありません。");
            }

            return result;
        },
        onSuccess: async () => {
            // セッションを確実に反映させるため、強制リロード
            window.location.href = callbackUrl;
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
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-[#021019] transition hover:bg-gray-100"
            >
                <img src="/web_neutral_rd_na@3x.png" alt="Google" className="h-5 w-5" />
                Googleで続行
            </button>

            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
                <div className="h-px flex-1 bg-white/10" />
                <span>または</span>
                <div className="h-px flex-1 bg-white/10" />
            </div>
            <label className="block">
                <span className="sr-only">メールアドレス</span>
                <input
                    type="email"
                    placeholder="メールアドレス"
                    className={clsx(
                        "w-full rounded-2xl border bg-[#0c1726] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/30",
                        errors.email ? "border-red-500" : "border-white/15"
                    )}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
            </label>
            <label className="block">
                <span className="sr-only">パスワード</span>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="パスワード"
                        className={clsx(
                            "w-full rounded-2xl border bg-[#0c1726] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/30",
                            errors.password ? "border-red-500" : "border-white/15"
                        )}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                        {showPassword ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
            </label>

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
                className="w-full rounded-2xl bg-[#06c4d8] py-3 text-sm font-semibold text-[#021019] transition hover:bg-[#05b0c4] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {mutation.isPending ? "続行中..." : "続行"}
            </button>
        </form>
    );
};
