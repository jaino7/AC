import Link from "next/link";

interface TrustRankDisplayProps {
  tier: number;
  trustScore: number;
  className?: string;
  variant?: "creator-pro" | "neon-pro" | "pure-lite" | "studio-pro" | "velvet-pro" | "zine-lite";
}

export function TrustRankDisplay({
  tier,
  trustScore,
  className = "",
  variant = "creator-pro",
}: TrustRankDisplayProps) {
  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 0:
        return "新規ユーザー";
      case 1:
        return "信頼済み";
      case 2:
        return "優良";
      default:
        return "";
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 0:
        return {
          bg: "bg-gray-600",
          text: "text-gray-600",
          badge: "bg-gray-100 text-gray-600",
        };
      case 1:
        return {
          bg: "bg-gradient-to-br from-blue-500 to-blue-600",
          text: "text-blue-600",
          badge: "bg-blue-50 text-blue-600",
        };
      case 2:
        return {
          bg: "bg-gradient-to-br from-purple-500 to-purple-600",
          text: "text-purple-600",
          badge: "bg-purple-50 text-purple-600",
        };
      default:
        return {
          bg: "bg-gray-600",
          text: "text-gray-600",
          badge: "bg-gray-100 text-gray-600",
        };
    }
  };

  const getImmediateLimit = (tier: number) => {
    switch (tier) {
      case 0:
        return "¥0（振込確認後に付与）";
      case 1:
        return "¥3,000";
      case 2:
        return "無制限";
      default:
        return "¥0";
    }
  };

  const getUpgradeMessage = (tier: number, trustScore: number) => {
    if (tier === 0) {
      return "振込1回完了でティア1にアップグレード";
    } else if (tier === 1) {
      const remaining = 3 - trustScore;
      return `あと${remaining}回の振込完了でティア2にアップグレード`;
    }
    return null;
  };

  const colors = getTierColor(tier);
  const tierLabel = getTierLabel(tier);
  const immediateLimit = getImmediateLimit(tier);
  const upgradeMessage = getUpgradeMessage(tier, trustScore);

  // Theme-specific link color
  const linkColor =
    variant === "neon-pro"
      ? "text-pink-400 hover:text-pink-300"
      : variant === "pure-lite"
        ? "text-emerald-400 hover:text-emerald-300"
        : variant === "studio-pro"
          ? "text-amber-400 hover:text-amber-300"
          : variant === "velvet-pro"
            ? "text-rose-400 hover:text-rose-300"
            : variant === "zine-lite"
              ? "text-slate-400 hover:text-slate-300"
              : "text-cyan-400 hover:text-cyan-300";

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center ${colors.bg}`}>
            <span className="text-white font-bold text-base sm:text-lg">{tier}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">信用ランク</p>
            <p className="text-sm sm:text-lg font-semibold text-gray-900 whitespace-nowrap truncate">
              ティア {tier}
              {tierLabel && ` - ${tierLabel}`}
            </p>
          </div>
        </div>
        <Link href="/trust-guide" className={`text-xs sm:text-sm ${linkColor} flex items-center gap-1 shrink-0 whitespace-nowrap`}>
          詳しく見る
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">即時チャージ上限</span>
          <span className={`font-semibold ${colors.text}`}>{immediateLimit}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-600">信用スコア</span>
          <span className="font-semibold text-gray-900">{trustScore}</span>
        </div>
        {upgradeMessage && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">{upgradeMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
