import { NeonProSignupForm } from "./signup-form";

export default function NeonProSignupPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#041024] px-4">
            {/* Neon glow effects */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[128px]" />
            </div>

            <section className="relative w-full max-w-md rounded-3xl border border-cyan-500/20 bg-[#0a1628]/80 p-8 backdrop-blur shadow-[0_0_50px_rgba(0,255,255,0.1)]">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold tracking-wider">
                        <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                            アカウント作成
                        </span>
                    </h1>
                    <p className="mt-2 text-sm text-white/60">
                        新しいアカウントを作成してコンテンツをお楽しみください
                    </p>
                </div>
                <NeonProSignupForm />
            </section>
        </main>
    );
}
