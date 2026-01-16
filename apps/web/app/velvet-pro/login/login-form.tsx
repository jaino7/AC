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

interface VelvetProLoginFormProps {
    handle?: string;
}

export const VelvetProLoginForm = ({ handle: propHandle }: VelvetProLoginFormProps = {}) => {
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
        onSuccess: (result) => {
            setMessage("ログインに成功しました。");
            router.push(result?.url ?? callbackUrl);
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
        <form className="mt-6 space-y-4 text-sm" onSubmit={handleSubmit(onSubmit)}>
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1a1b2e] py-3 text-sm font-semibold text-white transition hover:bg-[#23243a]"
            >
                <img src="/web_neutral_rd_na@3x.png" alt="Google" className="h-5 w-5" />
                Googleで続行
            </button>

            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
                <div className="h-px flex-1 bg-white/10" />
                <span>または</span>
                <div className="h-px flex-1 bg-white/10" />
            </div>
            <label className="block text-white/80">
                メールアドレス
                <input
                    type="email"
                    className={clsx(
                        "mt-2 w-full rounded-xl border bg-[#111222] px-4 py-3 text-white",
                        errors.email ? "border-red-500" : "border-white/10"
                    )}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
            </label>
            <label className="block text-white/80">
                パスワード
                <div
                    className={clsx(
                        "mt-2 flex items-center rounded-xl border bg-[#111222]",
                        errors.password ? "border-red-500" : "border-white/10"
                    )}
                >
                    <input
                        type="password"
                        className="flex-1 bg-transparent px-4 py-3 text-white focus:outline-none"
                        {...register("password")}
                    />
                    <button type="button" className="pr-4 text-xs text-yellow-400">
                        パスワードを忘れた？
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
            </label>

            {message && (
                <p
                    className={clsx(
                        "rounded-2xl border px-4 py-3 text-sm",
                        mutation.isError
                            ? "border-red-500/50 bg-red-500/10 text-red-400"
                            : "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                    )}
                >
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full rounded-2xl bg-yellow-400 py-3 text-sm font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {mutation.isPending ? "続行中..." : "続行"}
            </button>
        </form>
    );
};
