import { CreatorProSignupForm } from "./signup-form";

interface CreatorProSignupPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function CreatorProSignupPage({ handle, displayName, logoUrl }: CreatorProSignupPageProps = {}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4">
            <section className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#161b22] p-8 shadow-lg">
                <div className="mb-6 text-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-4 h-12 w-12 rounded-lg object-cover" />
                    ) : (
                        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-cyan-500 text-black text-xl font-bold">
                            {displayName?.[0] || "C"}
                        </div>
                    )}
                    <h1 className="text-2xl font-semibold text-white">
                        {displayName ? `${displayName}に登録` : "アカウント作成"}
                    </h1>
                    <p className="mt-2 text-sm text-white/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <CreatorProSignupForm />
            </section>
        </main>
    );
}

