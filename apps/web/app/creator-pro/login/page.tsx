import { CreatorProLoginForm } from "./login-form";

export default function CreatorProLoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02070e] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0d2038_0%,#02070e_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60')] bg-cover bg-center opacity-[0.04]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold text-white/90">ログインまたは登録</h1>
        </div>

        <section className="w-full max-w-sm rounded-[26px] border border-white/10 bg-[#070f1b]/80 px-8 py-9 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur">


          <CreatorProLoginForm />


        </section>
      </main>
    </div>
  );
}

