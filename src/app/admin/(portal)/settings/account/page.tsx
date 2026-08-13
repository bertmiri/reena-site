import { createClient } from "@/lib/supabase/server";
import { changeEmail, changePassword } from "./actions";

export const metadata = {
  title: "Account Settings",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, { kind: "ok" | "error"; text: string }> = {
  password: { kind: "ok", text: "Your password has been changed." },
  email_pending: {
    kind: "ok",
    text: "Verification emails sent. For security, confirm the change from BOTH your current and new inboxes — the email only changes after verification.",
  },
  pw_current: { kind: "error", text: "Your current password is incorrect." },
  pw_weak: { kind: "error", text: "New password must be at least 12 characters." },
  pw_mismatch: { kind: "error", text: "The new passwords do not match." },
  pw_failed: { kind: "error", text: "Could not change the password. Try again." },
  em_invalid: { kind: "error", text: "Enter a valid new email address." },
  em_same: { kind: "error", text: "That is already your current email." },
  em_password: { kind: "error", text: "Your current password is incorrect." },
  em_failed: { kind: "error", text: "Could not start the email change. Try again." },
};

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const message = MESSAGES[ok ?? ""] ?? MESSAGES[error ?? ""];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink focus:border-gold";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";
  const cardClass = "rounded-lg border border-sand bg-white/50 px-5 py-6";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl text-ink">Account</h1>
      <div className="thread-divider mt-3 w-24" />

      {message && (
        <p
          role="alert"
          className={
            message.kind === "ok"
              ? "mt-6 rounded-md border border-gold/40 bg-champagne/50 px-3.5 py-2.5 text-sm text-ink"
              : "mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep"
          }
        >
          {message.text}
        </p>
      )}

      <section className={`mt-8 ${cardClass}`}>
        <h2 className="font-display text-xl text-ink">Email Address</h2>
        <p className="mt-2 text-sm text-stone">
          Current email:{" "}
          <span className="font-medium text-ink">{user?.email}</span>
        </p>
        <form action={changeEmail} className="mt-5 space-y-4">
          <div>
            <label htmlFor="new_email" className={labelClass}>
              New email address
            </label>
            <input id="new_email" name="new_email" type="email" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="em_current" className={labelClass}>
              Current password
            </label>
            <input id="em_current" name="current" type="password" required autoComplete="current-password" className={inputClass} />
          </div>
          <p className="text-xs text-stone">
            For security, a verification link is sent to both addresses. The
            email only changes after you confirm.
          </p>
          <button type="submit" className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
            Verify New Email
          </button>
        </form>
      </section>

      <section className={`mt-6 ${cardClass}`}>
        <h2 className="font-display text-xl text-ink">Password</h2>
        <form action={changePassword} className="mt-5 space-y-4">
          <div>
            <label htmlFor="current" className={labelClass}>
              Current password
            </label>
            <input id="current" name="current" type="password" required autoComplete="current-password" className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              New password
            </label>
            <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
            <p className="mt-1 text-xs text-stone">At least 12 characters.</p>
          </div>
          <div>
            <label htmlFor="confirm" className={labelClass}>
              Confirm new password
            </label>
            <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
          </div>
          <button type="submit" className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
}
