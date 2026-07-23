"use client";

import { Shield, Star, Zap, Clock, Lock, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function TrustGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            信用ランクシステム
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            安全で快適なご利用のため、利用実績に応じて即時チャージ上限が変動するシステムです
          </p>
        </div>

        {/* Tier Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Tier 0 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-700">ティア 0</h3>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">0</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-semibold">新規ユーザー</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-400 mb-1">¥0</div>
                <div className="text-sm text-gray-600">即時チャージ上限</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Clock className="text-orange-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">
                    振込確認後に全額付与
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">運営による確認が必要</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-800 font-semibold">
                  最初の1回の振込完了で
                  <br />
                  <span className="text-blue-600">ティア1に自動昇格！</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tier 1 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-400 relative">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 border-b border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white">ティア 1</h3>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Star className="text-blue-600" size={20} />
                </div>
              </div>
              <p className="text-sm text-blue-100 font-semibold">信頼済みユーザー</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">¥3,000</div>
                <div className="text-sm text-gray-600">即時チャージ上限</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Zap className="text-yellow-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">
                    <strong className="text-blue-600">申告直後</strong>に3,000円まで利用可能
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="text-orange-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">
                    超過分は振込確認後に付与
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">待ち時間ほぼゼロ</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-800 font-semibold">
                  合計3回の振込完了で
                  <br />
                  <span className="text-green-600">ティア2に自動昇格！</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-purple-400">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 border-b border-purple-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white">ティア 2</h3>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Star className="text-purple-600" size={20} fill="currentColor" />
                </div>
              </div>
              <p className="text-sm text-purple-100 font-semibold">優良ユーザー</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">¥20,000</div>
                <div className="text-sm text-gray-600">即時チャージ上限</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Zap className="text-yellow-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">
                    <strong className="text-purple-600">申告直後</strong>に20,000円まで利用可能
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="text-orange-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">
                    超過分は振込確認後に付与
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="text-purple-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">最高ランクの信頼度</span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-800 font-semibold">
                  最上位ランクで
                  <br />
                  <span className="text-purple-600">最高の利便性を実現！</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={28} />
            ランクアップの仕組み
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  チャージと振込申告
                </h3>
                <p className="text-gray-700">
                  クレジットチャージを申請し、銀行振込を実行。振込完了後に「振込完了を申告」ボタンをクリックします。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  即時クレジット付与（ティア1以上）
                </h3>
                <p className="text-gray-700">
                  ティア1の場合は3,000円まで、ティア2の場合は20,000円まで即座にご利用可能になります。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  振込確認と信用スコア増加
                </h3>
                <p className="text-gray-700">
                  実際の振込が確認されると、信用スコアが+1され、保留クレジットも付与されます。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  自動ランクアップ
                </h3>
                <p className="text-gray-700 mb-3">
                  信用スコアが一定値に達すると、自動的に上位ランクへ昇格します。
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="text-blue-600" size={18} />
                      <span className="text-sm">
                        <strong className="text-blue-700">信用スコア 1以上</strong> → ティア1
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="text-purple-600" size={18} fill="currentColor" />
                      <span className="text-sm">
                        <strong className="text-purple-700">信用スコア 3以上</strong> → ティア2
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Penalties Section */}
        <div className="bg-red-50 rounded-xl shadow-lg p-8 mb-12 border-2 border-red-200">
          <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-3">
            <Lock className="text-red-600" size={28} />
            ペナルティとアカウント停止
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-3">
                アカウント停止となる場合
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <strong className="text-red-800 block mb-1">
                      虚偽の振込申告
                    </strong>
                    <p className="text-sm text-gray-700">
                      実際の振込金額と申告金額が一致しない場合
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <strong className="text-red-800 block mb-1">48時間以内の未入金</strong>
                    <p className="text-sm text-gray-700">
                      申告後48時間以内に振込が確認できない場合（申告は期限切れとなります）
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-3">
                停止されると…
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle size={16} />
                    <span className="text-sm">コンテンツの閲覧不可</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle size={16} />
                    <span className="text-sm">新規チャージ不可</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle size={16} />
                    <span className="text-sm">サブスク購読不可</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle size={16} />
                    <span className="text-sm">即時付与分は取り消し</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
              <p className="text-sm text-yellow-900">
                <strong className="block mb-2">⚠️ 重要な注意事項</strong>
                虚偽の申告は絶対に行わないでください。一度アカウントが停止されると、復旧は原則として行われません。
                正確な金額と振込情報を申告し、必ず振込を完了させてください。
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            よくある質問
          </h2>

          <div className="space-y-4">
            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span>信用スコアはどこで確認できますか？</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-4 text-gray-700">
                マイページのクレジット残高画面に「信用ランク：ティアX」として表示されています。
              </div>
            </details>

            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span>ティア1になるにはどれくらいかかりますか？</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-4 text-gray-700">
                初回の振込が確認されれば、即座にティア1へ昇格します。通常、振込確認には1〜2営業日程度かかります。
              </div>
            </details>

            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span>振込申告を間違えてしまった場合は？</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-4 text-gray-700">
                入力ミス等で金額が一致しない場合、アカウントが停止される可能性があります。申告前に必ず金額を確認してください。
                万が一停止された場合は、サポートまでお問い合わせください。
              </div>
            </details>

            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span>ティアは下がることはありますか？</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-4 text-gray-700">
                いいえ、一度上がったティアは下がることはありません。ただし、不正行為が発覚した場合はアカウント停止となります。
              </div>
            </details>

            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span>48時間以内に振込できなかったらどうなりますか？</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-4 text-gray-700">
                申告は期限切れとなり、ティア1以上のユーザーの場合は即時付与されたクレジットが取り消されます。
                再度チャージ申請を行ってください。
              </div>
            </details>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            今すぐティア1を目指しましょう！
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            初回の振込完了だけで即座にティア1へ昇格。3,000円までの即時チャージが可能になります。
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            クレジットをチャージする
          </Link>
        </div>
      </div>
    </div>
  );
}
