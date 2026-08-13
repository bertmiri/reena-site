import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getSiteSettings();
  const admin = createAdminClient();
  const { data: services } = await admin
    .from("services")
    .select("id, title, description")
    .eq("active", true)
    .order("sort_order")
    .limit(3);

  const card = "rounded-lg border border-sand bg-white/60 px-6 py-6";

  return (
    <main>
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="text-xs tracking-[0.3em] text-gold">MIRI · SARAWAK</p>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            {settings.hero_heading}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-paper/80">
            {settings.hero_sub}
          </p>
          <div className="thread-divider mx-auto mt-8 w-28 opacity-70" />
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href={whatsappLink(settings, "Hi Reena, I would like to ask about property in Miri.")} target="_blank" rel="noopener" className="rounded-md bg-gold px-5 py-2.5 font-medium text-ink transition-colors hover:bg-gold-deep hover:text-paper">Contact Me on WhatsApp</a>
            <Link href="/loan-calculator" className="rounded-md border border-paper/30 px-5 py-2.5 font-medium text-paper transition-colors hover:border-gold hover:text-gold">Calculate Your Loan</Link>
          </div>
          <p className="mt-8 text-xs text-paper/50">
            {settings.agent_name} · {settings.agent_title} · {settings.ren}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl text-ink">A personal advisor, not a portal</h2>
            <div className="thread-divider mt-4 w-24" />
            <p className="mt-5 leading-relaxed text-stone">{settings.bio_short}</p>
            <p className="mt-6"><Link href="/about" className="text-sm font-medium text-gold-deep underline-offset-4 hover:underline">About Me →</Link></p>
          </div>
          <div className={card}>
            <p className="text-xs font-medium uppercase tracking-wide text-gold-deep">Plan your purchase</p>
            <p className="mt-2 font-display text-2xl text-ink">What could your monthly repayment be?</p>
            <p className="mt-3 text-sm text-stone">Estimate instalments for any property price, down payment and tenure — in seconds.</p>
            <p className="mt-5"><Link href="/loan-calculator" className="inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">Calculate Your Loan</Link></p>
          </div>
        </div>
      </section>

      <section className="bg-white/50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-3xl text-ink">How I can help</h2>
          <div className="thread-divider mx-auto mt-4 w-24" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(services ?? []).map((s) => (
              <div key={s.id} className={card}>
                <h3 className="font-display text-xl text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{s.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center"><Link href="/services" className="text-sm font-medium text-gold-deep underline-offset-4 hover:underline">All Services →</Link></p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-gold/40 bg-champagne/30 px-6 py-8 text-center">
          <h2 className="font-display text-2xl text-ink">Already working with me?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-stone">
            Upload your supporting documents securely using the personal link I
            sent you — no account needed.
          </p>
          <p className="mt-5"><Link href="/upload-documents" className="inline-block rounded-md border border-gold px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold hover:text-paper">Upload Documents</Link></p>
        </div>
      </section>
    </main>
  );
}
