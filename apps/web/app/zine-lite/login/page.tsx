import { ZineLiteLoginForm } from "./login-form";

interface ZineLiteLoginPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function ZineLiteLoginPage({ handle, displayName, logoUrl }: ZineLiteLoginPageProps = {}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#6a6a6a] px-4 py-16 text-white">
      <div className="w-full max-w-sm rounded-[28px] border border-green-500/50 bg-black/95 p-8 text-white shadow-[0_0_80px_rgba(0,255,0,0.2)]">
        {logoUrl && (
          <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-4 h-12 w-12 rounded-full object-cover" />
        )}
        <h1 className="pb-4 text-center text-xl font-semibold">
          {displayName ? `${displayName}にログイン` : "ログインまたは登録"}
        </h1>

        <ZineLiteLoginForm handle={handle} />
      </div>
    </div>
  );
}
