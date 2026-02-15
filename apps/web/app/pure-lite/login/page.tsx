import { PureLiteLoginForm } from "./login-form";

interface PureLiteLoginPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function PureLiteLoginPage({ handle, displayName, logoUrl }: PureLiteLoginPageProps = {}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#8b8d94] px-4 py-12 text-[#1f1f22]">
      <div className="w-full max-w-sm rounded-[28px] border border-black/10 bg-white/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur">
        {logoUrl && (
          <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-4 h-12 w-12 rounded-full object-cover" />
        )}
        <h1 className="pb-4 text-xl font-semibold">
          {displayName ? `${displayName}にログイン` : "ログインまたは登録"}
        </h1>

        <PureLiteLoginForm handle={handle} />
      </div>
    </div>
  );
}
