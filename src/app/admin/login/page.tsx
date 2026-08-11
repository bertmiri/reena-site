import type { Metadata } from "next";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Agent Login",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a valid email address and password.",
  auth: "Email or password is incorrect.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink placeholder:text-stone/60 focus:border-hibiscus";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="font-display text-3xl text-ink">Reena Mazlan</p>
          <p className="mt-1 text-sm tracking-wide text-stone">Agent Portal</p>
          <div className="thread-divider thread-divider--blend mx-auto mt-6 w-24" />
        </header>

        <form action={signIn} className="space-y-5">
          <input type="hidden" name="next" value={next ?? "/admin"} />

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email address
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={inputClass} />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
              {errorMessage}
            </p>
          )}

          <button type="submit" className="w-full rounded-md bg-ink px-4 py-2.5 font-medium text-paper transition-colors hover:bg-ink-soft">
            Sign in
          </button>

          <p className="text-center text-sm">
            <a href="/admin/forgot-password" className="text-stone underline-offset-4 hover:text-ink hover:underline">
              Forgot your password?
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
