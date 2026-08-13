import type { Metadata } from "next";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";
import { submitEnquiry } from "./actions";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Reena Mazlan — RM Property Hub, Miri, Sarawak.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const settings = await getSiteSettings();

  const inputClass =
    "w-full rounded-md border border-gold/25 bg-night-soft px-3.5 py-2.5 text-paper placeholder:text-paper/30 focus:border-gold";
  const labelClass = "mb-1.5 block text-sm font-medium text-paper/80";

  return (
    <main className="bg-night text-paper">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs tracking-[0.25em] text-gold-bright">CONTACT</p>
          <h1 className="mt-3 font-display text-4xl text-paper">Let&apos;s talk property</h1>
          <div className="thread-divider mx-auto mt-5 w-24 opacity-70" />
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <p className="leading-relaxed text-paper/70">
              The fastest way to reach me is WhatsApp — or leave a message here
              and I will come back to you.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <p><a href={whatsappLink(settings)} target="_blank" rel="noopener" className="text-gold-bright transition-colors hover:text-gold">WhatsApp — {settings.phone}</a></p>
              <p><a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="text-paper/70 transition-colors hover:text-paper">Call — {settings.phone}</a></p>
              <p><a href={`mailto:${settings.email}`} className="text-paper/70 transition-colors hover:text-paper">Email — {settings.email}</a></p>
            </div>
            <p className="mt-8 text-xs text-paper/40">
              {settings.agent_name} · {settings.agent_title} · {settings.ren}
            </p>
          </div>

          <div>
            {sent ? (
              <div className="rounded-lg border border-gold/30 bg-night-soft px-6 py-8 text-center">
                <p className="font-display text-2xl text-gold-bright">Message sent</p>
                <p className="mt-2 text-sm text-paper/60">Thank you — I will be in touch soon.</p>
              </div>
            ) : (
              <form action={submitEnquiry} className="space-y-4">
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <div>
                  <label htmlFor="name" className={labelClass}>Name</label>
                  <input id="name" name="name" required minLength={2} maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input id="email" name="email" type="email" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
                  <input id="phone" name="phone" type="tel" maxLength={40} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="message" className={labelClass}>Message</label>
                  <textarea id="message" name="message" required minLength={10} maxLength={3000} rows={5} className={inputClass} />
                </div>
                {error && (
                  <p className="rounded-md border border-hibiscus/40 bg-hibiscus/10 px-3.5 py-2.5 text-sm text-paper/90">
                    {error === "2" ? "Could not send right now — please WhatsApp me instead." : "Please check the form — a valid email and a message of at least 10 characters."}
                  </p>
                )}
                <button type="submit" className="w-full rounded-md bg-gold px-5 py-3 font-medium text-night transition-colors hover:bg-gold-bright">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
