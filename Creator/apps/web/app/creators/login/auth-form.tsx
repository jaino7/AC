"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { clsx } from "clsx";
import { z } from "zod";
import { creatorSignup } from "@/lib/api";
import { startGoogleOAuthLogin } from "@/lib/oauth-login";

// Email入力のバリデーション
const emailSchema = z.object({
    email: z.string().email("有効なメールアドレスを入力してください")
});

// ログイン用のバリデーション
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "パスワードを入力してください")
});

// サインアップ用のバリデーション
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(8, "パスワードは8文字以上で入力してください")
        .regex(/[a-zA-Z]/, "英字（大文字または小文字）を含めてください")
        .regex(/[0-9]/, "数字を含めてください"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: "利用規約に同意してください" })
    }),
    confirmAdult: z.literal(true, {
        errorMap: () => ({ message: "18歳以上であることを確認してください" })
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"]
});

type EmailInput = z.infer<typeof emailSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type SignupInput = z.infer<typeof signupSchema>;

type AuthStep = "email" | "login" | "signup";

export const AuthForm = () => {
    const router = useRouter();
    const [step, setStep] = useState<AuthStep>("email");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Email入力フォーム
    const emailForm = useForm<EmailInput>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" }
    });

    // ログインフォーム
    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });

    // サインアップフォーム
    const signupForm = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false as any,
            confirmAdult: false as any
        }
    });

    // メールアドレスチェック
    const emailCheckMutation = useMutation({
        mutationFn: async (values: EmailInput) => {
            const response = await fetch("/api/auth/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "エラーが発生しました");
            }

            return response.json();
        },
        onSuccess: (data, variables) => {
            setEmail(variables.email);
            if (data.exists) {
                // 既存ユーザー: ログインフローへ
                loginForm.setValue("email", variables.email);
                setStep("login");
            } else {
                // 新規ユーザー: サインアップフローへ
                signupForm.setValue("email", variables.email);
                setStep("signup");
            }
            setMessage(null);
        },
        onError: (error: Error) => {
            setMessage(error.message);
            setIsError(true);
        }
    });

    // ログイン
    const loginMutation = useMutation({
        mutationFn: async (values: LoginInput) => {
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false
            });

            if (!result) {
                throw new Error("ログインに失敗しました");
            }

            if (result.error) {
                throw new Error("メールアドレスまたはパスワードが正しくありません");
            }

            return result;
        },
        onSuccess: async () => {
            setMessage("ログインに成功しました");
            setIsError(false);

            // セッションからhandleを取得してリダイレクト
            const { getSession } = await import("next-auth/react");
            const session = await getSession();
            const handle = (session?.user as any)?.handle;

            if (handle) {
                router.push(`/creators/${handle}/dashboard`);
            } else {
                router.push("/creators/dashboard");
            }
        },
        onError: (error: Error) => {
            setMessage(error.message);
            setIsError(true);
        }
    });

    // サインアップ
    const signupMutation = useMutation({
        mutationFn: (values: SignupInput) =>
            creatorSignup({
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                acceptTerms: values.acceptTerms,
                confirmAdult: values.confirmAdult
            }),
        onSuccess: async (data) => {
            setMessage("アカウントを作成しました");
            setIsError(false);

            // サインアップ後にログインしてセッションを取得
            await signIn("credentials", {
                email: data.email || email,
                password: signupForm.getValues("password"),
                redirect: false
            });

            // セッションからhandleを取得
            const { getSession } = await import("next-auth/react");
            const session = await getSession();
            const handle = (session?.user as any)?.handle;

            if (handle) {
                router.push(`/creators/${handle}/dashboard`);
            } else {
                router.push("/creators/dashboard");
            }
        },
        onError: (error: Error) => {
            setMessage(error.message);
            setIsError(true);
        }
    });

    // Googleログイン
    const handleGoogleAuth = () => {
        startGoogleOAuthLogin({ callbackUrl: "/creators/dashboard" });
    };

    const onEmailSubmit = (values: EmailInput) => {
        setMessage(null);
        setIsError(false);
        emailCheckMutation.mutate(values);
    };

    const onLoginSubmit = (values: LoginInput) => {
        setMessage(null);
        setIsError(false);
        loginMutation.mutate(values);
    };

    const onSignupSubmit = (values: SignupInput) => {
        setMessage(null);
        setIsError(false);
        signupMutation.mutate(values);
    };

    const handleBack = () => {
        setStep("email");
        setMessage(null);
        setIsError(false);
    };

    // 第一段階: メールアドレス入力
    if (step === "email") {
        return (
            <form className="space-y-5" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    aria-label="Sign in with Google"
                    onClick={handleGoogleAuth}
                    className="gap-2 bg-[#F2F2F2] hover:bg-[#e3e3e3]"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Googleで続行
                </Button>

                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                    <div className="h-px flex-1 bg-neutral-200" />
                    <span>または</span>
                    <div className="h-px flex-1 bg-neutral-200" />
                </div>

                <Field label="メールアドレス" error={emailForm.formState.errors.email?.message}>
                    <Input
                        type="email"
                        placeholder="example@email.com"
                        autoComplete="email"
                        {...emailForm.register("email")}
                    />
                </Field>

                {message && (
                    <p
                        className={clsx(
                            "rounded-2xl border px-4 py-3 text-sm",
                            isError
                                ? "border-red-200 bg-red-50 text-red-600"
                                : "border-green-200 bg-green-50 text-green-600"
                        )}
                    >
                        {message}
                    </p>
                )}

                <Button
                    type="submit"
                    fullWidth
                    disabled={emailCheckMutation.isPending}
                    aria-busy={emailCheckMutation.isPending}
                >
                    {emailCheckMutation.isPending ? "確認中..." : "続行"}
                </Button>
            </form>
        );
    }

    // 第二段階（既存ユーザー）: パスワード入力
    if (step === "login") {
        return (
            <form className="space-y-5" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="text-black underline hover:no-underline"
                    >
                        ← 戻る
                    </button>
                    <span>{email}</span>
                </div>

                <Field label="パスワード" error={loginForm.formState.errors.password?.message}>
                    <div className="relative">
                        <Input
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="パスワードを入力"
                            autoComplete="current-password"
                            {...loginForm.register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            aria-label={showLoginPassword ? "パスワードを隠す" : "パスワードを表示"}
                        >
                            {showLoginPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </Field>

                <div className="text-right">
                    <a href="/creators/password-reset" className="text-sm font-semibold text-black underline">
                        パスワードをお忘れですか？
                    </a>
                </div>

                {message && (
                    <p
                        className={clsx(
                            "rounded-2xl border px-4 py-3 text-sm",
                            isError
                                ? "border-red-200 bg-red-50 text-red-600"
                                : "border-green-200 bg-green-50 text-green-600"
                        )}
                    >
                        {message}
                    </p>
                )}

                <Button
                    type="submit"
                    fullWidth
                    disabled={loginMutation.isPending}
                    aria-busy={loginMutation.isPending}
                >
                    {loginMutation.isPending ? "ログイン中..." : "ログイン"}
                </Button>
            </form>
        );
    }

    // 第二段階（新規ユーザー）: 登録情報入力
    if (step === "signup") {
        return (
            <form className="space-y-5" onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="text-black underline hover:no-underline"
                    >
                        ← 戻る
                    </button>
                    <span>{email}</span>
                </div>

                <Field label="パスワード" error={signupForm.formState.errors.password?.message}>
                    <div className="relative">
                        <Input
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="8桁以上で入力"
                            autoComplete="new-password"
                            {...signupForm.register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            aria-label={showSignupPassword ? "パスワードを隠す" : "パスワードを表示"}
                        >
                            {showSignupPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </Field>

                <Field label="パスワード（確認）" error={signupForm.formState.errors.confirmPassword?.message}>
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="もう一度入力"
                            autoComplete="new-password"
                            {...signupForm.register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}
                        >
                            {showConfirmPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </Field>

                <CheckboxField
                    label={
                        <span>
                            <a href="/terms/creators" target="_blank" className="text-black underline hover:text-blue-600">利用規約</a>
                            と
                            <a href="/privacy" target="_blank" className="text-black underline hover:text-blue-600">プライバシーポリシー</a>
                            に同意します
                        </span>
                    }
                    error={signupForm.formState.errors.acceptTerms?.message}
                >
                    <Checkbox {...signupForm.register("acceptTerms")} />
                </CheckboxField>

                <CheckboxField
                    label="私は18歳以上であり、成人向けコンテンツを提供することに同意します"
                    error={signupForm.formState.errors.confirmAdult?.message}
                >
                    <Checkbox {...signupForm.register("confirmAdult")} />
                </CheckboxField>

                {message && (
                    <p
                        className={clsx(
                            "rounded-2xl border px-4 py-3 text-sm",
                            isError
                                ? "border-red-200 bg-red-50 text-red-600"
                                : "border-green-200 bg-green-50 text-green-600"
                        )}
                    >
                        {message}
                    </p>
                )}

                <Button
                    type="submit"
                    fullWidth
                    disabled={signupMutation.isPending}
                    aria-busy={signupMutation.isPending}
                >
                    {signupMutation.isPending ? "送信中..." : "アカウントを作成"}
                </Button>
            </form>
        );
    }

    return null;
};

const Field = ({
    label,
    error,
    children
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) => (
    <label className="block text-sm font-semibold text-black">
        <span className="mb-1 inline-block">{label}</span>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
);

const CheckboxField = ({
    label,
    error,
    children
}: {
    label: string | React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1 text-sm text-neutral-700">
        <label className="flex items-start gap-3">
            {children}
            <span>{label}</span>
        </label>
        {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
);
