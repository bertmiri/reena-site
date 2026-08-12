import type { Metadata } from "next";
import { requestPasswordReset } from "./actions";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="font-display text-3xl text-ink">RM Property Hub</p>
          <p className="mt-1 text-sm tracking-wide text-stone">Agent Portal</p>
          <div className="thread-divider thread-divider--blend mx-auto mt-6 w-24" />
        </header>

        {sent ? (
          <div className="rounded-md border border-gold/40 bg-champagne/40 px-4 py-4 text-center">
            <p className="text-sm font-medium text-ink">Check your email</p>
            <p className="mt-1 text-sm text-stone">
              If that address has an account, a password-reset link is on its
              way. The link expires after a short time.
            </p>
            <p className="mt-4 text-sm">
              <a href="/admin/login" className="text-stone underline-offset-4 hover:text-ink hover:underline">Back to login</a>
            </p>
          </div>
        ) : (
          <form action={requestPasswordReset} className="space-y-5">
            {error === "expired" && (
              <p className="rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
                That reset link has expired or was already used. Request a new
                one below.
              </p>
            )}
            <p className="text-sm text-stone">
              Enter your account email and we will send you a secure link to
              set a new password.
            </p>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email address
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink placeholder:text-stone/60 focus:border-gold" placeholder="you@example.com" />
            </div>
            <button type="submit" className="w-full rounded-md bg-ink px-4 py-2.5 font-medium text-paper transition-colors hover:bg-ink-soft">
              Send Reset Link
            </button>
            <p className="text-center text-sm">
              <a href="/admin/login" className="text-stone underline-offset-4 hover:text-ink hover:underline">Back to login</a>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
