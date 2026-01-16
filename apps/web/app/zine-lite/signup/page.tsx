import { ZineLiteSignupForm } from "./signup-form";

interface ZineLiteSignupPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function ZineLiteSignupPage({ handle, displayName, logoUrl }: ZineLiteSignupPageProps = {}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4">
            <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8 shadow-lg">
                <div className="mb-6 text-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-4 h-12 w-12 rounded-full object-cover" />
                    ) : (
                        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-black text-xl font-bold">
                            {displayName?.[0] || "Z"}
                        </div>
                    )}
                    <h1 className="text-2xl font-semibold text-white">
                        {displayName ? `${displayName}に登録` : "アカウント作成"}
                    </h1>
                    <p className="mt-2 text-sm text-white/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <ZineLiteSignupForm />
            </section>
        </main>
    );
}
