import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";
import { fetchPublicListings, listingsVisible } from "@/lib/listings-public";
import { formatListingPrice, type ListingKind } from "@/lib/listings";
import { Calculator } from "./loan-calculator/calculator";

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getSiteSettings();
  const admin = createAdminClient();

  const [{ data: services }, { data: loan }] = await Promise.all([
    admin
      .from("services")
      .select("id, title, description")
      .eq("active", true)
      .order("sort_order")
      .limit(3),
    admin
      .from("loan_settings")
      .select(
        "default_interest_rate, default_down_payment, default_tenure, minimum_tenure, maximum_tenure"
      )
      .eq("id", true)
      .single(),
  ]);

  const { visible: showListings } = await listingsVisible();
  const featured = showListings
    ? (await fetchPublicListings()).filter((l) => l.status !== "sold").slice(0, 3)
    : [];

  const loanDefaults = {
    rate: Number(loan?.default_interest_rate ?? 4.2),

    downPct: Number(loan?.default_down_payment ?? 10),
    tenure: loan?.default_tenure ?? 30,
    minTenure: loan?.minimum_tenure ?? 5,
    maxTenure: loan?.maximum_tenure ?? 40,
  };

  return (
    <main className="bg-night text-paper">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,#2a2318_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-20">
          <Image src="/brand/logo.jpg" alt="RM Property Hub — Find, Invest, Grow" width={340} height={340} priority className="mx-auto mix-blend-screen" />
          <h1 className="mx-auto mt-2 max-w-xl font-display text-3xl leading-snug text-paper sm:text-4xl">
            {settings.hero_heading}
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={whatsappLink(settings, "Hi Reena, I would like to ask about property in Miri.")} target="_blank" rel="noopener" className="rounded-md bg-gold px-6 py-3 font-semibold text-night transition-colors hover:bg-gold-bright">WhatsApp Me</a>
            <a href="#calculator" className="rounded-md border border-gold/50 px-6 py-3 font-medium text-gold-bright transition-colors hover:border-gold-bright">Calculate Your Loan</a>
          </div>
          <p className="mt-10 text-xs tracking-[0.2em] text-paper/80">
            {settings.agent_name.toUpperCase()} · {settings.ren} · MIRI, SARAWAK
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-t border-gold/15">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.25em] text-gold-bright">FEATURED</p>
                <h2 className="mt-2 font-display text-3xl text-paper">Properties</h2>
              </div>
              <Link href="/listings" className="text-xs tracking-[0.2em] text-paper/75 transition-colors hover:text-gold-bright">VIEW ALL →</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((l, i) => (
                <Link key={l.id} href={`/listings/${l.slug}`} style={{ animationDelay: `${i * 60}ms` }} className="rm-rise group block overflow-hidden rounded-lg border border-gold/20 bg-night-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50">
                  <div className="aspect-[4/3] overflow-hidden bg-night">
                    {l.cover_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={l.cover_url} alt={l.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-paper/40">No photo</div>
                    )}
                  </div>
                  <div className="space-y-1 px-5 py-5">
                    <p className="font-display text-xl text-gold-bright">{formatListingPrice(l.price, l.price_is_from, l.listing_kind as ListingKind)}</p>
                    <p className="font-medium text-paper">{l.title}</p>
                    <p className="text-sm text-paper/75">{l.area}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-gold/15">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="grid gap-px overflow-hidden rounded-lg border border-gold/20 bg-gold/20 md:grid-cols-3">
            {(services ?? []).map((s) => (
              <div key={s.id} className="bg-night-soft px-7 py-9">
                <div className="thread-divider w-10" />
                <h2 className="mt-4 font-display text-xl text-gold-bright">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="bg-paper text-ink">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <p className="text-xs tracking-[0.25em] text-gold-deep">PLAN YOUR PURCHASE</p>
            <h2 className="mt-3 font-display text-3xl text-ink">Home Loan Calculator</h2>
            <div className="thread-divider mx-auto mt-4 w-24" />
          </div>
          <Calculator defaults={loanDefaults} />
          <p className="mt-8 text-center text-xs leading-relaxed text-stone">
            These calculations are estimates only. Actual rates, fees and loan
            approval depend on the financial institution and the applicant&apos;s
            circumstances.
          </p>
        </div>
      </section>

      <section className="border-t border-gold/15">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="rounded-lg border border-gold/20 bg-night-soft px-7 py-9 text-center">
            <p className="font-display text-2xl text-paper">Already working with me?</p>
            <p className="mt-2 text-sm text-paper/80">Upload your documents through your secure personal link.</p>
            <p className="mt-6"><Link href="/upload-documents" className="inline-block rounded-md border border-gold/50 px-5 py-2.5 text-sm font-medium text-gold-bright transition-colors hover:border-gold-bright">Upload Documents</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
