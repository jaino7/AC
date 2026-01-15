"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FanSignupInput, fanSignupSchema } from "@/lib/validators/fan-auth";
import { fanSignup } from "@/lib/api";
import Link from "next/link";

// テーマに応じたスタイルマッピング
const themeStyles: Record<string, {
    container: string;
    card: string;
    input: string;
    button: string;
    link: string;
    text: string;
    label: string;
    error: string;
    success: string;
}> = {
    "neon-pro": {
        container: "min-h-screen flex items-center justify-center bg-[#041024] px-4 py-12",
        card: "w-full max-w-md space-y-6 rounded-3xl border border-cyan-500/20 bg-[#0a1a3a]/80 p-8 shadow-[0_0_60px_rgba(0,255,255,0.1)]",
        input: "w-full rounded-2xl border border-white/15 bg-[#0f1c3c] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none",
        button: "w-full rounded-2xl bg-cyan-400 py-3 text-sm font-semibold text-[#041024] hover:bg-cyan-300 disabled:opacity-50",
        link: "text-cyan-400 underline",
        text: "text-white/70",
        label: "text-white/60",
        error: "text-red-400",
        success: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
    },
    "pure-lite": {
        container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white px-4 py-12",
        card: "w-full max-w-md space-y-6 rounded-3xl border border-pink-200 bg-white p-8 shadow-xl",
        input: "w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none",
        button: "w-full rounded-2xl bg-pink-500 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-50",
        link: "text-pink-500 underline",
        text: "text-gray-600",
        label: "text-gray-700",
        error: "text-red-500",
        success: "border-pink-300 bg-pink-50 text-pink-600"
    },
    "zine-lite": {
        container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white px-4 py-12",
        card: "w-full max-w-md space-y-6 rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl",
        input: "w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none",
        button: "w-full rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50",
        link: "text-emerald-500 underline",
        text: "text-gray-600",
        label: "text-gray-700",
        error: "text-red-500",
        success: "border-emerald-300 bg-emerald-50 text-emerald-600"
    },
    "creator-pro": {
        container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-12",
        card: "w-full max-w-md space-y-6 rounded-3xl border border-cyan-500/30 bg-slate-800/80 p-8 shadow-xl",
        input: "w-full rounded-2xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none",
        button: "w-full rounded-2xl bg-cyan-500 py-3 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-50",
        link: "text-cyan-400 underline",
        text: "text-slate-300",
        label: "text-slate-400",
        error: "text-red-400",
        success: "border-cyan-500/50 bg-cyan-900/30 text-cyan-400"
    },
    "velvet-pro": {
        container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white px-4 py-12",
        card: "w-full max-w-md space-y-6 rounded-3xl border border-amber-200 bg-white p-8 shadow-xl",
        input: "w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none",
        button: "w-full rounded-2xl bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50",
        link: "text-amber-600 underline",
        text: "text-gray-600",
        label: "text-gray-700",
        error: "text-red-500",
        success: "border-amber-300 bg-amber-50 text-amber-600"
    },
    "studio-pro": {
        container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white px-4 py-12",
        card: "w-full max-w-md space-y-6 rounded-3xl border border-blue-200 bg-white p-8 shadow-xl",
        input: "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none",
        button: "w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50",
        link: "text-blue-600 underline",
        text: "text-gray-600",
        label: "text-gray-700",
        error: "text-red-500",
        success: "border-blue-300 bg-blue-50 text-blue-600"
    }
};

interface SignupFormProps {
    creatorHandle: string;
    creatorName: string;
    theme: string;
    logoUrl: string | null;
}

export function SignupForm({ creatorHandle, creatorName, theme, logoUrl }: SignupFormProps) {
    const styles = themeStyles[theme] || themeStyles["creator-pro"];
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);

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

    const mutation = useMutation({
        mutationFn: async (values: FanSignupInput) => {
            await fanSignup({ ...values, creatorHandle });

            // Auto login after signup
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: `/${creatorHandle}/content`
            });

            if (!result || result.error) {
                throw new Error("登録は成功しましたが、ログインに失敗しました。ログインページからお試しください。");
            }

            return result;
        },
        onSuccess: (result) => {
            setMessage("アカウントが作成されました！");
            router.push(result?.url ?? `/${creatorHandle}/content`);
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
        <div className={styles.container}>
            <div className={styles.card}>
                {/* ヘッダー */}
                <div className="text-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt={creatorName} className="mx-auto h-16 w-16 rounded-full object-cover" />
                    ) : (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl font-bold text-white">
                            {creatorName.charAt(0)}
                        </div>
                    )}
                    <h1 className={`mt-4 text-2xl font-bold ${styles.text}`}>
                        {creatorName}
                    </h1>
                    <p className={`mt-1 text-sm ${styles.label}`}>
                        新規アカウント登録
                    </p>
                </div>

                {/* Google認証ボタン */}
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: `/${creatorHandle}/content` })}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 py-3 text-sm font-semibold ${styles.text} transition hover:bg-white/5`}
                >
                    <img src="/web_neutral_rd_na@3x.png" alt="Google" className="h-5 w-5" />
                    Googleで続行
                </button>

                <div className={`flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] ${styles.label}`}>
                    <div className="h-px flex-1 bg-current opacity-30" />
                    <span>または</span>
                    <div className="h-px flex-1 bg-current opacity-30" />
                </div>

                {/* フォーム */}
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className={`mb-1 block text-xs font-semibold ${styles.label}`}>
                            表示名（任意）
                        </label>
                        <input
                            type="text"
                            placeholder="表示名"
                            className={styles.input}
                            {...register("displayName")}
                        />
                    </div>

                    <div>
                        <label className={`mb-1 block text-xs font-semibold ${styles.label}`}>
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            placeholder="fan@example.com"
                            className={`${styles.input} ${errors.email ? 'border-red-500' : ''}`}
                            {...register("email")}
                        />
                        {errors.email && <p className={`mt-1 text-xs ${styles.error}`}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className={`mb-1 block text-xs font-semibold ${styles.label}`}>
                            パスワード
                        </label>
                        <input
                            type="password"
                            placeholder="8文字以上"
                            className={`${styles.input} ${errors.password ? 'border-red-500' : ''}`}
                            {...register("password")}
                        />
                        {errors.password && <p className={`mt-1 text-xs ${styles.error}`}>{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className={`mb-1 block text-xs font-semibold ${styles.label}`}>
                            パスワード（確認）
                        </label>
                        <input
                            type="password"
                            placeholder="もう一度入力"
                            className={`${styles.input} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && <p className={`mt-1 text-xs ${styles.error}`}>{errors.confirmPassword.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className={`flex items-start gap-3 text-sm ${styles.text}`}>
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded"
                                {...register("acceptTerms")}
                            />
                            <span>
                                <Link href="/terms" className={styles.link}>利用規約</Link>と
                                <Link href="/privacy" className={styles.link}>プライバシーポリシー</Link>に同意します
                            </span>
                        </label>
                        {errors.acceptTerms && <p className={`text-xs ${styles.error}`}>{errors.acceptTerms.message}</p>}

                        <label className={`flex items-start gap-3 text-sm ${styles.text}`}>
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded"
                                {...register("confirmAdult")}
                            />
                            <span>私は18歳以上です</span>
                        </label>
                        {errors.confirmAdult && <p className={`text-xs ${styles.error}`}>{errors.confirmAdult.message}</p>}
                    </div>

                    {message && (
                        <p className={`rounded-2xl border px-4 py-3 text-sm ${mutation.isError ? `border-red-500/50 bg-red-500/10 ${styles.error}` : styles.success}`}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className={styles.button}
                    >
                        {mutation.isPending ? "アカウント作成中..." : "アカウントを作成"}
                    </button>

                    <p className={`text-center text-sm ${styles.text}`}>
                        すでにアカウントをお持ちですか？{" "}
                        <Link href={`/${creatorHandle}/login`} className={styles.link}>
                            ログイン
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
