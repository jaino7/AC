"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Shield, TrendingUp, Crown, Globe, Palette, ChevronRight, Check } from "lucide-react";

// --- Data ---

const catchphrases = [
  "あなたのコンテンツに、\n真の価値を。",
  "業界最安水準の手数料で、\n手残りを最大化。",
  "あなたのブランドを、\nあなたの手で。",
];

type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  feeRate: string;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "まずは無料で体験",
    features: ["15GB ストレージ", "販売手数料 8.0%", "標準テーマ"],
    feeRate: "8.0%",
    cta: "無料で始める",
  },
  {
    id: "lite",
    name: "Lite",
    price: { monthly: 2980, yearly: 29800 },
    description: "成長中のクリエイターに最適",
    features: ["新規登録後 2ヶ月間無料", "200GB ストレージ", "販売手数料 5.0%", "独自ドメイン & 追加テーマ"],
    highlighted: true,
    feeRate: "5.0%",
    cta: "2ヶ月無料で試す",
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 19800, yearly: 198000 },
    description: "本気で稼ぐクリエイターのための最上位プラン",
    features: ["1TB ストレージ", "業界最低水準 販売手数料 2.8%", "独自ドメイン & フルカスタマイズ", "最優先サポート対応"],
    feeRate: "2.8%",
    cta: "Businessを選択",
  },
];

const comparisonFeatures = [
  { name: "月額料金", free: "0円", lite: "2,980円", business: "19,800円" },
  { name: "無料トライアル", free: "—", lite: "初回 2ヶ月間無料", business: "—" },
  { name: "販売手数料", free: "8%", lite: "5%", business: "2.8%" },
  { name: "ストレージ", free: "15GB", lite: "200GB", business: "1TB" },
  { name: "独自ドメイン", free: "×", lite: "○", business: "○" },
  { name: "カスタム設定", free: "標準のみ", lite: "追加テーマ", business: "カスタマイズOK" },
  { name: "サポート対応", free: "通常", lite: "優先", business: "最優先" },
];

const themes = [
  {
    name: "Creator Pro",
    gradient: "from-violet-600 to-purple-900",
    accent: "bg-violet-400",
    image: "/themes/creator-pro.png",
    slug: "creator-pro"
  },
  {
    name: "Neon Pro",
    gradient: "from-cyan-500 to-blue-900",
    accent: "bg-cyan-400",
    image: "/themes/neon-pro.png",
    slug: "neon-pro"
  },
  {
    name: "Studio Pro",
    gradient: "from-slate-600 to-slate-900",
    accent: "bg-slate-300",
    image: "/themes/studio-pro.png",
    slug: "studio-pro"
  },
  {
    name: "Velvet Pro",
    gradient: "from-rose-600 to-rose-950",
    accent: "bg-rose-400",
    image: "/themes/velvet-pro.png",
    slug: "velvet-pro"
  },
  {
    name: "Pure Lite",
    gradient: "from-gray-100 to-white",
    accent: "bg-gray-800",
    light: true,
    image: "/themes/pure-lite.png",
    slug: "pure-lite"
  },
  {
    name: "Zine Lite",
    gradient: "from-amber-400 to-orange-600",
    accent: "bg-amber-200",
    image: "/themes/zine-lite.png",
    slug: "zine-lite"
  },
];

// --- Hooks ---

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// --- Components ---

type ParticleStyle = {
  left: string;
  bottom: string;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
  width: string;
  height: string;
};

function Particles() {
  const [particles, setParticles] = useState<ParticleStyle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        bottom: `-${Math.random() * 20}%`,
        animationDuration: `${6 + Math.random() * 8}s`,
        animationDelay: `${Math.random() * 8}s`,
        opacity: 0.3 + Math.random() * 0.5,
        width: `${2 + Math.random() * 3}px`,
        height: `${2 + Math.random() * 3}px`,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((style, i) => (
        <div
          key={i}
          className="particle"
          style={style}
        />
      ))}
    </div>
  );
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

// --- Main Page ---

export default function LandingPage() {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const planCtaHref = (_planId: string) => "/creators/signup";

  // Catchphrase rotation
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % catchphrases.length);
        setIsFading(false);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection for header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #040B1A 0%, #0A1628 100%)" }}>
      {/* ===== Navigation ===== */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#040B1A]/80 backdrop-blur-xl shadow-lg shadow-black/20" : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <img src="/logo-top.png" alt="CocoBa Logo" className="h-8 w-auto" />
            </Link>
            <a
              href="#pricing"
              className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors"
            >
              プラン
            </a>
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

      {/* ===== Hero Section ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <Particles />

        {/* Radial glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #002366 0%, transparent 70%)" }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Rotating catchphrase */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span
              className={`inline-block transition-all duration-500 ${!mounted || isFading ? "opacity-0 translate-y-[-10px]" : "opacity-100 translate-y-0"
                }`}
              style={{
                background: "linear-gradient(135deg, #FFFFFF 30%, #C5A059 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                whiteSpace: "pre-line",
              }}
            >
              {catchphrases[currentPhrase]}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            業界最安水準 <span className="text-white font-semibold">2.8%</span> の手数料。
            <br className="hidden sm:block" />
            独自ドメイン・完全自立型で、あなたのブランドを守りながら収益を最大化。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/creators/signup"
              className="group flex items-center gap-2 text-lg font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, #C5A059, #D4AF6A)", color: "#040B1A" }}
            >
              無料で始める
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#pricing"
              className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
            >
              料金プランを見る
            </a>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A1628] to-transparent" />
      </section>

      {/* ===== Section 2: Value Proposition ===== */}
      <section className="relative py-12 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-white">
              もう、プラットフォームの都合に
              <br className="hidden sm:block" />
              振り回されない。
            </h2>
            <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
              CocoBaは、クリエイターが本当に必要とする自由と安全を提供します。
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Shield */}
            <AnimatedSection>
              <div className="group relative rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 h-full">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #002366, #003399)" }}
                >
                  <Shield className="w-7 h-7 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  凍結リスク・規約変更からの解放
                </h3>
                <p className="text-white/50 leading-relaxed">
                  突然のアカウント凍結や一方的な規約変更に怯える必要はもうありません。あなたのコンテンツとファンとの関係を、あなた自身がコントロールできます。
                </p>
                {/* Glow effect */}
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(0,35,102,0.3), transparent)" }} />
              </div>
            </AnimatedSection>

            {/* Card 2: TrendingUp */}
            <AnimatedSection>
              <div className="group relative rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 h-full">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #002366, #6B4F1D)" }}
                >
                  <TrendingUp className="w-7 h-7 text-blue-200" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  安全かつ長期的な収益最大化
                </h3>
                <p className="text-white/50 leading-relaxed">
                  業界最安水準の手数料2.8%で、あなたの手残りを最大化。安定した決済基盤と透明な料金体系で、長期的な成長をサポートします。
                </p>
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(0,35,102,0.2), rgba(197,160,89,0.2))" }} />
              </div>
            </AnimatedSection>

            {/* Card 3: Crown */}
            <AnimatedSection>
              <div className="group relative rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 h-full">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #8B6914, #C5A059)" }}
                >
                  <Crown className="w-7 h-7 text-yellow-200" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  完全自立型のブランディング
                </h3>
                <p className="text-white/50 leading-relaxed">
                  独自ドメインで、あなただけのブランドを構築。プラットフォームの看板ではなく、あなた自身の名前でファンとつながれます。
                </p>
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(197,160,89,0.3), transparent)" }} />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== Section 3: Pricing ===== */}
      <section id="pricing" className="relative py-12 sm:py-32 px-4 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-white">
              シンプルで透明な料金体系
            </h2>
            <p className="text-center text-white/50 mb-4 max-w-2xl mx-auto">
              あなたの成長に合わせて選べる3つのプラン。すべてのプランに基本機能が含まれています。
            </p>
            <p className="text-center text-white/40 text-sm mb-12">
              お支払い方法は銀行振込のみとなります。<br />
              これにより、アダルトコンテンツの収益化が可能となり、クレジットカード決済では実現できない低手数料（2.8%〜）を実現しています。
            </p>
          </AnimatedSection>

          {/* Billing toggle */}
          <AnimatedSection className="flex justify-center mb-12">
            <div className="inline-flex rounded-full p-1 border border-white/10 bg-white/5">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${billingCycle === "monthly"
                  ? "bg-white text-[#040B1A]"
                  : "text-white/60 hover:text-white"
                  }`}
              >
                月払い
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${billingCycle === "yearly"
                  ? "bg-white text-[#040B1A]"
                  : "text-white/60 hover:text-white"
                  }`}
              >
                年払い（2ヶ月分お得）
              </button>
            </div>
          </AnimatedSection>

          {/* Plan cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => {
              const price = plan.price[billingCycle];
              const monthlyPrice = billingCycle === "yearly" && price > 0 ? Math.floor(price / 12) : price;
              const isHighlighted = plan.highlighted;

              return (
                <AnimatedSection key={plan.id}>
                  <div
                    className={`relative rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col ${isHighlighted
                      ? "border-[#C5A059]/50 bg-white/[0.08] backdrop-blur-sm scale-[1.02]"
                      : "border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08]"
                      }`}
                  >
                    {isHighlighted && (
                      <>
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
                          style={{ background: "linear-gradient(135deg, #C5A059, #D4AF6A)", color: "#040B1A" }}
                        >
                          人気No.1
                        </div>
                        <div className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-white">
                          2ヶ月無料
                        </div>
                      </>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-sm text-white/50 mt-1">{plan.description}</p>
                    </div>

                    <div className="text-center mb-8">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-lg text-white/60">¥</span>
                        <span className="text-5xl font-bold text-white">
                          {monthlyPrice.toLocaleString("ja-JP")}
                        </span>
                        <span className="text-sm text-white/60">/月</span>
                      </div>
                      {billingCycle === "yearly" && price > 0 && (
                        <p className="mt-1 text-xs text-white/40">
                          年間 ¥{price.toLocaleString("ja-JP")}
                        </p>
                      )}
                      {price === 0 && (
                        <p className="mt-1 text-xs text-white/40">永久無料</p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, i) => {
                        const isTrial = feature.includes("無料");
                        return (
                          <li key={i} className={`flex items-start gap-3 text-sm ${isTrial ? "rounded-lg bg-emerald-500/10 px-3 py-2 -mx-3" : ""}`}>
                            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isTrial ? "text-emerald-400" : ""}`} style={isTrial ? undefined : { color: "#C5A059" }} />
                            <span className={isTrial ? "text-emerald-300 font-semibold" : "text-white/70"}>{feature}</span>
                          </li>
                        );
                      })}
                    </ul>

                    <Link
                      href={planCtaHref(plan.id)}
                      className={`block w-full text-center py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] ${isHighlighted
                        ? "text-[#040B1A]"
                        : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      style={isHighlighted ? { background: "linear-gradient(135deg, #C5A059, #D4AF6A)" } : undefined}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Comparison table */}
          <AnimatedSection>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <h3 className="text-xl font-bold text-white text-center py-6 border-b border-white/10">
                プラン比較
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">機能</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white/60">Free</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">Lite</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white/60">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white/80">{feature.name}</td>
                        <td className="px-6 py-4 text-sm text-center text-white/50">{feature.free}</td>
                        <td className="px-6 py-4 text-sm text-center text-white font-medium">{feature.lite}</td>
                        <td className="px-6 py-4 text-sm text-center text-white/70">{feature.business}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== Section 4: Branding & Features (The Weapon) ===== */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-white">
              あなたの価値を、正しく表現するための武器。
            </h2>
            <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
              独自ドメインと洗練されたテーマで、プロフェッショナルなブランドを構築。
            </p>
          </AnimatedSection>

          {/* Custom domain card */}
          <AnimatedSection className="mb-16">
            <div className="rounded-2xl p-8 sm:p-12 border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #002366, #003399)" }}
                  >
                    <Globe className="w-10 h-10 text-blue-300" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    独自ドメインで、あなただけの世界を。
                  </h3>
                  <p className="text-white/50 leading-relaxed max-w-xl">
                    <span className="font-semibold text-white/70">yourbrand.com</span> であなたのページを公開。
                    プラットフォームの URL ではなく、あなた自身のブランドでファンを迎えましょう。
                    設定は簡単、プログラミングの知識は一切不要です。
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Theme grid */}
          <AnimatedSection>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-sm text-white/50 mb-2">
                <Palette className="w-4 h-4" />
                プログラミング不要
              </div>
              <h3 className="text-2xl font-bold text-white">
                6つの洗練されたテーマから選択
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <div
                  key={theme.name}
                  className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Theme preview image */}
                  <div className="relative h-48 sm:h-56 bg-gradient-to-br from-white/5 to-white/10">
                    <Image
                      src={theme.image}
                      alt={`${theme.name} テーマプレビュー`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  {/* Theme name */}
                  <div className="bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <p className="text-sm font-medium text-white/80">{theme.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== Section 5: Closing CTA ===== */}
      <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #C5A059 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-16 leading-tight">
              さあ、真の自由と、
              <br />
              最大の手残りを手に入れよう。
            </h2>

            <Link
              href="/creators/signup"
              className="group inline-flex items-center gap-2 text-lg font-bold px-12 py-5 rounded-xl transition-all hover:scale-105 animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, #C5A059, #D4AF6A)", color: "#040B1A" }}
            >
              無料で始める
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/40 text-xs mt-6">
              アダルトコンテンツの作成は本人確認が必要です
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== Footer ===== */}
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
                  <Link href="/terms/creators" className="text-white/50 hover:text-white transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/legal/commercial-transaction/creators" className="text-white/50 hover:text-white transition-colors">
                    特定商取引法
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
              &copy; 2025 CocoBa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
