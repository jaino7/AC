import { AuthForm } from "./auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12 text-black">
      <div className="w-full max-w-md space-y-6 rounded-[32px] border border-black/10 bg-white p-10 shadow-[0px_40px_90px_rgba(0,0,0,0.1)]">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">ログインまたは登録</h1>
        </div>
        <AuthForm />
        <footer className="text-center text-xs text-neutral-500">
          <div className="flex justify-center gap-4">
            <a href="/terms/creators" target="_blank" className="hover:text-black hover:underline">利用規約</a>
            <a href="/privacy" target="_blank" className="hover:text-black hover:underline">プライバシーポリシー</a>
            <a href="/legal/commercial-transaction/creators" target="_blank" className="hover:text-black hover:underline">特定商取引法に基づく表記</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
