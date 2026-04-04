import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-16 px-4">
      <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.08)]">
        <SignupForm />
      </section>
    </main>
  );
}
