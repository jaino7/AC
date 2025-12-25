"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  creatorSignupSchema,
  CreatorSignupInput
} from "@/lib/validators/creator-signup";
import { creatorSignup } from "@/lib/api";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

export const SignupForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreatorSignupInput>({
    resolver: zodResolver(creatorSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as any,
      confirmAdult: false as any
    }
  });

  const handleGoogleAuth = () => {
    signIn("google", {
      callbackUrl: "/creators/dashboard"
    });
  };

  const mutation = useMutation({
    mutationFn: (values: CreatorSignupInput) =>
      creatorSignup({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        acceptTerms: values.acceptTerms,
        confirmAdult: values.confirmAdult
      }),
    onSuccess: async (data, variables) => {
      reset();

      // サインアップ後に自動ログインしてセッションを取得
      await signIn("credentials", {
        email: variables.email,
        password: variables.password,
        redirect: false
      });

      // セッションからhandleを取得してリダイレクト
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const handle = (session?.user as any)?.handle;

      if (handle) {
        router.push(`/creators/${handle}/dashboard`);
      } else {
        router.push("/creators/dashboard");
      }
    }
  });

  const onSubmit = async (values: CreatorSignupInput) => {
    setErrorMessage(null);
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">アカウントを作成</h2>
        <p className="text-sm text-neutral-500">
          Googleで登録するか、メールアドレスで登録するとすぐにダッシュボードへ移動します。
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        fullWidth
        aria-label="Sign up with Google"
        onClick={handleGoogleAuth}
        className="gap-2 bg-[#F2F2F2] hover:bg-[#e3e3e3]"
      >
        <img src="\web_neutral_rd_na@3x.png" alt="Google logo" className="h-5 w-5" />
        Googleでサインアップ
      </Button>

      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-neutral-400">
        <div className="h-px flex-1 bg-neutral-200" />
        <span>または</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <Field label="メールアドレス" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="creator@example.com"
          autoComplete="email"
          {...register("email")}
        />
      </Field>

      <Field label="パスワード" error={errors.password?.message}>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="8桁以上で入力"
            autoComplete="new-password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
          >
            {showPassword ? (
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

      <Field label="パスワード（確認）" error={errors.confirmPassword?.message}>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="もう一度入力"
            autoComplete="new-password"
            {...register("confirmPassword")}
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
        error={errors.acceptTerms?.message}
      >
        <Checkbox {...register("acceptTerms")} />
      </CheckboxField>

      <CheckboxField
        label="私は18歳以上であり、成人向けコンテンツを提供することに同意します"
        error={errors.confirmAdult?.message}
      >
        <Checkbox {...register("confirmAdult")} />
      </CheckboxField>

      {errorMessage && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        fullWidth
        disabled={mutation.isPending}
        aria-busy={mutation.isPending}
      >
        {mutation.isPending ? "送信中..." : "アカウントを作成する"}
      </Button>

      <p className="text-center text-sm text-neutral-500">
        すでにアカウントをお持ちですか？{" "}
        <Link href="/creators/login" className="text-black underline">
          ログイン
        </Link>
      </p>
    </form>
  );
};

const Field = ({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
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
  children: ReactNode;
}) => (
  <div className="space-y-1 text-sm text-neutral-700">
    <label className="flex items-start gap-3">
      {children}
      <span>{label}</span>
    </label>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);
