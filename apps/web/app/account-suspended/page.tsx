"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Lock, AlertTriangle, Send } from "lucide-react";
import Link from "next/link";

export default function AccountSuspendedPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    transferDetails: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill email if session exists
  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "送信に失敗しました");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "送信に失敗しました。もう一度お試しください。";

      console.error("Error details:", errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Send className="text-green-600" size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            お問い合わせを受け付けました
          </h1>

          <p className="text-gray-600 mb-6">
            ご連絡いただきありがとうございます。
            <br />
            内容を確認の上、2〜3営業日以内にご登録のメールアドレス宛にご返信いたします。
          </p>

          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="text-red-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                アカウント停止中
              </h1>
              <p className="text-gray-600 mt-1">
                このアカウントは現在ご利用いただけません
              </p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-red-800 font-semibold mb-2">
                  アカウントが停止された理由
                </h3>
                <p className="text-red-700 text-sm">
                  振込申告と実際の入金額が一致しなかったため、不正利用の可能性があると判断されました。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-base mb-3">
              停止中のアカウントでは以下がご利用いただけません：
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✕</span>
                <span>コンテンツの閲覧</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✕</span>
                <span>新規クレジットチャージ</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✕</span>
                <span>サブスクリプションの購読</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✕</span>
                <span>単体コンテンツの購入</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            お心当たりがない場合
          </h2>
          <p className="text-gray-600 mb-6">
            不正な申告を行っていない場合や、入力ミス等の理由により停止された場合は、以下のフォームよりお問い合わせください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="transferDetails"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                振込詳細 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="transferDetails"
                name="transferDetails"
                required
                value={formData.transferDetails}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="振込日時、金額、振込名義人名など"
              />
              <p className="text-xs text-gray-500 mt-1">
                例: 2024年1月15日、5,000円、ヤマダタロウ
              </p>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="停止された理由についてお心当たりがない場合は、詳しい状況をご記入ください"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ご注意：</strong>
                調査には2〜3営業日ほどお時間をいただく場合がございます。調査の結果、不正行為が確認された場合は、アカウントの復旧はできかねます。
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "送信中..." : "問い合わせを送信"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/trust-guide"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <span>信用ランクシステムについて詳しく見る</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
