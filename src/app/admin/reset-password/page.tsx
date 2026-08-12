import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setNewPassword } from "./actions";

export const metadata: Metadata = {
  title: "Set New Password",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  weak: "Password must be at least 12 characters.",
  mismatch: "The two passwords do not match.",
  failed: "Could not update the password. Please try again.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/forgot-password?error=expired");
  }

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink focus:border-gold";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="font-display text-3xl text-ink">RM Property Hub</p>
          <p className="mt-1 text-sm tracking-wide text-stone">
            Set a new password
          </p>
          <div className="thread-divider thread-divider--blend mx-auto mt-6 w-24" />
        </header>

        <form action={setNewPassword} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              New password
            </label>
            <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
            <p className="mt-1 text-xs text-stone">At least 12 characters.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-ink">
              Confirm new password
            </label>
            <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
          </div>

          {error && ERRORS[error] && (
            <p role="alert" className="rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
              {ERRORS[error]}
            </p>
          )}

          <button type="submit" className="w-full rounded-md bg-ink px-4 py-2.5 font-medium text-paper transition-colors hover:bg-ink-soft">
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
}
