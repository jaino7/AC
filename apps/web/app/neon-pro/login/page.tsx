import { NeonProLoginForm } from "./login-form";

interface NeonProLoginPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function NeonProLoginPage({ handle, displayName, logoUrl }: NeonProLoginPageProps = {}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4a4a4a] px-4 py-16 text-white">
      <div className="relative w-full max-w-sm rounded-[28px] border border-cyan-500/30 bg-[#081129] px-8 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 rounded-[28px] bg-cyan-500/30 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-6">
          <header className="space-y-2 text-center">
            {logoUrl && (
              <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-2 h-12 w-12 rounded-lg object-cover" />
            )}
            <p className="text-2xl font-semibold">
              {displayName ? `${displayName}にログイン` : "ログインまたは登録"}
            </p>
          </header>

          <NeonProLoginForm />
        </div>
      </div>
    </div>
  );
}
