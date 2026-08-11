import Link from "next/link";
import { createClientRecord } from "../actions";

export const metadata = {
  title: "Add Client",
  robots: { index: false, follow: false },
};

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink placeholder:text-stone/60 focus:border-gold";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl text-ink">Add Client</h1>
      <div className="thread-divider mt-3 w-24" />

      {error && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {error}
        </p>
      )}

      <form action={createClientRecord} className="mt-8 space-y-5">
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name *
          </label>
          <input id="full_name" name="full_name" required minLength={2} maxLength={120} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" maxLength={160} className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input id="phone" name="phone" type="tel" maxLength={40} placeholder="+60..." className={inputClass} />
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>
            Private notes
          </label>
          <textarea id="notes" name="notes" rows={4} maxLength={5000} className={inputClass} />
          <p className="mt-1 text-xs text-stone">Never visible to clients.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Create Client
          </button>
          <Link href="/admin/clients" className="text-sm text-stone hover:text-ink">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
