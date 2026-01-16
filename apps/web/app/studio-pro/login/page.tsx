import { StudioProLoginForm } from "./login-form";

interface StudioProLoginPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function StudioProLoginPage({ handle, displayName, logoUrl }: StudioProLoginPageProps = {}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#778096] px-4 py-16 text-[#1f1f22]">
      <div className="w-full max-w-sm rounded-[28px] border border-black/10 bg-white/95 p-8 shadow-[0_40px_140px_rgba(0,0,0,0.3)] backdrop-blur">
        {logoUrl && (
          <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-4 h-12 w-12 rounded-[10px] object-cover" />
        )}
        <h1 className="pb-4 text-center text-xl font-semibold">
          {displayName ? `${displayName}にログイン` : "ログインまたは登録"}
        </h1>

        <StudioProLoginForm />
      </div>
    </div>
  );
}
