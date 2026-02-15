import { VelvetProLoginForm } from "./login-form";

interface VelvetProLoginPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function VelvetProLoginPage({ handle, displayName, logoUrl }: VelvetProLoginPageProps = {}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#757575] px-4 py-16">
      <div className="w-full max-w-sm rounded-[28px] border border-yellow-600/40 bg-[#0a0a0f]/95 p-8 text-white shadow-[0_30px_120px_rgba(255,216,0,0.25)] backdrop-blur">
        {logoUrl && (
          <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-4 h-12 w-12 rounded-lg object-cover" />
        )}
        <h1 className="pb-4 text-center text-xl font-semibold text-yellow-300">
          {displayName ? `${displayName}にログイン` : "ログインまたは登録"}
        </h1>

        <VelvetProLoginForm handle={handle} />
      </div>
    </div>
  );
}
