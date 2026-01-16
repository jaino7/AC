import { StudioProSignupForm } from "./signup-form";

interface StudioProSignupPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function StudioProSignupPage({ handle, displayName, logoUrl }: StudioProSignupPageProps = {}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#030814] px-4">
            <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#070e1e] p-8 shadow-lg">
                <div className="mb-6 text-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt={displayName || "Creator"} className="mx-auto mb-4 h-12 w-12 rounded-[10px] object-cover" />
                    ) : (
                        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[10px] bg-[#2f6dff] text-white text-xl font-bold">
                            {displayName?.[0] || "S"}
                        </div>
                    )}
                    <h1 className="text-2xl font-semibold text-white">
                        {displayName ? `${displayName}に登録` : "アカウント作成"}
                    </h1>
                    <p className="mt-2 text-sm text-white/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <StudioProSignupForm />
            </section>
        </main>
    );
}
