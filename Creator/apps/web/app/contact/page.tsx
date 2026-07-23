"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  category: z.string().min(1, "お問い合わせ種別を選択してください"),
  subject: z.string().min(1, "件名を入力してください"),
  message: z.string().min(10, "内容は10文字以上で入力してください"),
  policyAgreement: z.boolean().refine((val) => val === true, {
    message: "プライバシーポリシーに同意してください",
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const categories = [
  { value: "", label: "選択してください" },
  { value: "account", label: "アカウント・ログイン" },
  { value: "subscription", label: "サブスクリプション・決済" },
  { value: "creator_usage", label: "クリエイター機能の使い方" },
  { value: "fan_usage", label: "ファン機能の使い方" },
  { value: "content", label: "コンテンツ管理・投稿" },
  { value: "payment_issue", label: "支払い・請求について" },
  { value: "technical", label: "技術的な問題・バグ報告" },
  { value: "custom_domain", label: "カスタムドメイン" },
  { value: "partnership", label: "提携・ビジネス相談" },
  { value: "other", label: "その他" },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  // Scroll detection for header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "送信に失敗しました");
      }

      setSubmitStatus({
        type: "success",
        message: "お問い合わせを受け付けました。ご連絡ありがとうございます。",
      });
      reset();
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "送信に失敗しました。もう一度お試しください。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #040B1A 0%, #0A1628 100%)" }}>
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-[#040B1A]/80 backdrop-blur-xl shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <img src="/logo-top.png" alt="CocoBa Logo" className="h-8 w-auto" />
            </Link>
            <Link
              href="/#pricing"
              className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors"
            >
              プラン
            </Link>
            <Link
              href="/contact"
              className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors"
            >
              お問い合わせ
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/creators/login"
              className="text-sm text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
            >
              ログイン
            </Link>
            <Link
              href="/creators/signup"
              className="text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #C5A059, #D4AF6A)", color: "#040B1A" }}
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              お問い合わせ
            </h1>
            <p className="text-white/60 mb-8">
              お問い合わせ内容を以下のフォームにご記入ください。
            </p>

            {submitStatus && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-500/10 text-green-300 border border-green-500/20"
                    : "bg-red-500/10 text-red-300 border border-red-500/20"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  お名前 <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#C5A059] focus:border-transparent"
                  placeholder="山田 太郎"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#C5A059] focus:border-transparent"
                  placeholder="example@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  お問い合わせ種別 <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  {...register("category")}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C5A059] focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[#0A1628] text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  件名 <span className="text-red-400">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register("subject")}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#C5A059] focus:border-transparent"
                  placeholder="お問い合わせの件名を入力してください"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  お問い合わせ内容 <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  rows={6}
                  {...register("message")}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#C5A059] focus:border-transparent resize-none"
                  placeholder="お問い合わせ内容を詳しくご記入ください"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Privacy Policy Agreement */}
              <div className="flex items-start">
                <input
                  id="policyAgreement"
                  type="checkbox"
                  {...register("policyAgreement")}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-[#C5A059] focus:ring-[#C5A059]"
                />
                <label
                  htmlFor="policyAgreement"
                  className="ml-2 text-sm text-white/70"
                >
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-[#C5A059] hover:underline"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意する <span className="text-red-400">*</span>
                </label>
              </div>
              {errors.policyAgreement && (
                <p className="text-sm text-red-400">
                  {errors.policyAgreement.message}
                </p>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    isSubmitting
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "text-[#040B1A] hover:scale-[1.02]"
                  }`}
                  style={
                    !isSubmitting
                      ? { background: "linear-gradient(135deg, #C5A059, #D4AF6A)" }
                      : undefined
                  }
                >
                  {isSubmitting ? "送信中..." : "送信する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Column 1: About */}
            <div>
              <img src="/logo-top.png" alt="CocoBa Logo" className="h-8 w-auto mb-4" />
              <p className="text-sm text-white/50 leading-relaxed">
                業界最安水準の手数料で、クリエイターの収益を最大化するプラットフォーム。
              </p>
            </div>

            {/* Column 2: Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">法的情報</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms/fans" className="text-white/50 hover:text-white transition-colors">
                    利用規約（ファン向け）
                  </Link>
                </li>
                <li>
                  <Link href="/terms/creators" className="text-white/50 hover:text-white transition-colors">
                    利用規約（クリエイター向け）
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/legal/commercial-transaction/fans" className="text-white/50 hover:text-white transition-colors">
                    特定商取引法（ファン向け）
                  </Link>
                </li>
                <li>
                  <Link href="/legal/commercial-transaction/creators" className="text-white/50 hover:text-white transition-colors">
                    特定商取引法（クリエイター向け）
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">サポート</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-white transition-colors">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link href="/creators/login" className="text-white/50 hover:text-white transition-colors">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/creators/signup" className="text-white/50 hover:text-white transition-colors">
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 text-center">
            <p className="text-sm text-white/30">
              &copy; {new Date().getFullYear()} CocoBa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
