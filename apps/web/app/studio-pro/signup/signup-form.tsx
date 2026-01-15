"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { FanSignupInput, fanSignupSchema } from "@/lib/validators/fan-auth";
import { fanSignup } from "@/lib/api";
import { getCreatorHandleFromPath } from "@/lib/utils/creator";
import { clsx } from "clsx";
import Link from "next/link";

export const StudioProSignupForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FanSignupInput>({
        resolver: zodResolver(fanSignupSchema),
        defaultValues: { email: "", password: "", confirmPassword: "", displayName: "", acceptTerms: false as any, confirmAdult: false as any }
    });

    const router = useRouter();
    const pathname = usePathname();
    const [message, setMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (values: FanSignupInput) => {
            const creatorHandle = getCreatorHandleFromPath(pathname);
            if (!creatorHandle) throw new Error("クリエイターが特定できませんでした");
            await fanSignup({ ...values, creatorHandle });
            const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false, callbackUrl: "/studio-pro/content" });
            if (!result || result.error) throw new Error("登録は成功しましたが、ログインに失敗しました。");
            return result;
        },
        onSuccess: (result) => { setMessage("アカウントが作成されました！"); router.push(result?.url ?? "/studio-pro/content"); }
    });

    const onSubmit = async (values: FanSignupInput) => {
        setMessage(null);
        try { await mutation.mutateAsync(values); } catch (error) { setMessage((error as Error).message); }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <button type="button" onClick={() => signIn("google", { callbackUrl: "/studio-pro/content" })}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <img src="/web_neutral_rd_na@3x.png" alt="Google" className="h-5 w-5" />
                Googleで続行
            </button>

            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-white/40">
                <div className="h-px flex-1 bg-white/10" /><span>または</span><div className="h-px flex-1 bg-white/10" />
            </div>

            <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-white/60">表示名（任意）</span>
                <input type="text" placeholder="表示名" className="w-full rounded-xl border border-white/10 bg-[#030814] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#2f6dff] focus:outline-none" {...register("displayName")} />
            </label>

            <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-white/60">メールアドレス</span>
                <input type="email" placeholder="fan@example.com" className={clsx("w-full rounded-xl border bg-[#030814] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#2f6dff] focus:outline-none", errors.email ? "border-red-500" : "border-white/10")} {...register("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </label>

            <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-white/60">パスワード</span>
                <input type="password" placeholder="8文字以上" className={clsx("w-full rounded-xl border bg-[#030814] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#2f6dff] focus:outline-none", errors.password ? "border-red-500" : "border-white/10")} {...register("password")} />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </label>

            <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-white/60">パスワード（確認）</span>
                <input type="password" placeholder="もう一度入力" className={clsx("w-full rounded-xl border bg-[#030814] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#2f6dff] focus:outline-none", errors.confirmPassword ? "border-red-500" : "border-white/10")} {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </label>

            <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-white/70">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-[#2f6dff]" {...register("acceptTerms")} />
                    <span><Link href="/terms" className="text-[#2f6dff] underline">利用規約</Link>と<Link href="/privacy" className="text-[#2f6dff] underline">プライバシーポリシー</Link>に同意します</span>
                </label>
                {errors.acceptTerms && <p className="text-xs text-red-400">{errors.acceptTerms.message}</p>}

                <label className="flex items-start gap-3 text-sm text-white/70">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-[#2f6dff]" {...register("confirmAdult")} />
                    <span>私は18歳以上です</span>
                </label>
                {errors.confirmAdult && <p className="text-xs text-red-400">{errors.confirmAdult.message}</p>}
            </div>

            {message && <p className={clsx("rounded-xl border px-4 py-3 text-sm", mutation.isError ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-[#2f6dff]/50 bg-[#2f6dff]/10 text-[#2f6dff]")}>{message}</p>}

            <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-[#2f6dff] py-3 text-sm font-semibold text-white hover:bg-[#2563eb] disabled:opacity-50">
                {mutation.isPending ? "アカウント作成中..." : "アカウントを作成"}
            </button>

            <p className="text-center text-sm text-white/60">
                すでにアカウントをお持ちですか？ <Link href="/studio-pro/login" className="text-[#2f6dff] underline">ログイン</Link>
            </p>
        </form>
    );
};
