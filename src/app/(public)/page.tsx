import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";
import { fetchPublicListings, listingsVisible } from "@/lib/listings-public";
import { formatListingPrice, type ListingKind } from "@/lib/listings";
import { Calculator } from "./loan-calculator/calculator";
import { Reveal } from "@/components/reveal";

export const revalidate = 300;

function SectionHead({
  eyebrow,
  title,
  action,
  dark = true,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5"
      style={{ borderColor: dark ? "rgba(230,192,105,0.2)" : "rgba(184,147,63,0.3)" }}>
      <div>
        <p className={`text-[11px] tracking-[0.28em] ${dark ? "text-gold-bright" : "text-gold-deep"}`}>{eyebrow}</p>
        <h2 className={`mt-2 font-display text-3xl sm:text-4xl ${dark ? "text-paper" : "text-ink"}`}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const admin = createAdminClient();

  const [{ data: services }, { data: loan }] = await Promise.all([
    admin.from("services").select("id, title, description").eq("active", true).order("sort_order").limit(3),
    admin
      .from("loan_settings")
      .select("default_interest_rate, default_down_payment, default_tenure, minimum_tenure, maximum_tenure")
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

  const shell = "mx-auto max-w-5xl px-5 sm:px-6";
  const section = "py-16 sm:py-20";

  return (
    <main className="bg-night text-paper">
      <section className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-gold/15">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_50%_45%,#2a2318_0%,transparent_72%)]" />
        <div className="rm-mark-wrap pointer-events-none">
          <Image src="/brand/rm-mark.png" alt="" aria-hidden width={900} height={783} priority className="rm-mark w-[min(78vw,620px)] max-w-none" />
        </div>

        <div className={`relative ${shell} py-20 text-center`}>
          <p className="rm-e1 text-[11px] tracking-[0.32em] text-gold-bright">RM PROPERTY HUB</p>
          <h1 className="rm-e2 mx-auto mt-5 max-w-3xl font-display text-4xl leading-[1.1] text-paper sm:text-6xl">
            {settings.hero_heading}
          </h1>

          <div className="mx-auto mt-10 flex max-w-lg flex-col divide-y divide-gold/15 border-y border-gold/15 text-left">
            {showListings && (
              <Link href="/listings" className="rm-drop-1 group flex items-center justify-between gap-4 py-3.5">
                <span className="text-[15px] text-paper transition-colors group-hover:text-gold-bright">View all listings</span>
                <span className="text-gold-bright transition-transform group-hover:translate-x-1">→</span>
              </Link>
            )}
            <a href="#calculator" className="rm-drop-2 group flex items-center justify-between gap-4 py-3.5">
              <span className="text-[15px] text-paper transition-colors group-hover:text-gold-bright">Loan calculator</span>
              <span className="text-gold-bright transition-transform group-hover:translate-x-1">→</span>
            </a>
            <Link href="/upload-documents" className="rm-drop-3 group flex items-center justify-between gap-4 py-3.5">
              <span className="text-[15px] text-paper transition-colors group-hover:text-gold-bright">Upload client documents</span>
              <span className="text-gold-bright transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <a href={whatsappLink(settings, "Hi Reena, I would like to ask about property in Miri.")} target="_blank" rel="noopener" className="rm-e4 mx-auto mt-7 block w-full max-w-lg rounded-md bg-gold px-6 py-3.5 font-semibold text-night transition-colors hover:bg-gold-bright">WhatsApp Me</a>

          <p className="rm-e5 mt-10 text-[11px] tracking-[0.28em] text-paper/70">
            {settings.agent_name.toUpperCase()} · {settings.ren} · MIRI, SARAWAK
          </p>
        </div>
      </section>

      {/* Featured properties — adapts to how many exist */}
      {featured.length > 0 && (
        <section className="border-b border-gold/15">
          <div className={`${shell} ${section}`}>
            <Reveal>
              <SectionHead
                eyebrow="FEATURED"
                title="Properties"
                action={<Link href="/listings" className="text-[11px] tracking-[0.22em] text-paper/70 transition-colors hover:text-gold-bright">VIEW ALL →</Link>}
              />
            </Reveal>

            <div className={`mt-8 grid gap-5 ${featured.length === 1 ? "sm:max-w-md" : featured.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {featured.map((l, i) => (
                <Reveal key={l.id} delay={i * 80}>
                  <Link href={`/listings/${l.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1">
                    {l.cover_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={l.cover_url} alt={l.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-night-soft text-paper/40">No photo</div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="font-display text-2xl leading-tight text-gold-bright">{formatListingPrice(l.price, l.price_is_from, l.listing_kind as ListingKind)}</p>
                      <p className="mt-1 font-medium leading-snug text-paper">{l.title}</p>
                      <p className="text-sm text-paper/85">{l.area}</p>
                      <p className="mt-1.5 text-xs tracking-wide text-paper/80">
                        {[l.bedrooms != null ? `${l.bedrooms} bed` : null, l.bathrooms != null ? `${l.bathrooms} bath` : null, l.built_up_sqft != null ? `${l.built_up_sqft} sqft` : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="border-b border-gold/15">
        <div className={`${shell} ${section}`}>
          <Reveal>
            <SectionHead eyebrow="WHAT I DO" title="How I can help" />
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(services ?? []).map((s, i) => (
              <Reveal key={s.id} delay={i * 80} className="h-full">
                <div className="flex h-full flex-col rounded-lg border border-gold/20 bg-night-soft px-6 py-7">
                  <h3 className="font-display text-2xl leading-tight text-gold-bright">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/80">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator — deliberate light panel, same header pattern */}
      <section id="calculator" className="bg-paper text-ink">
        <div className={`${shell} ${section}`}>
          <Reveal>
            <SectionHead eyebrow="PLAN YOUR PURCHASE" title="Home Loan Calculator" dark={false} />
          </Reveal>
          <Reveal delay={100}>
            <Calculator defaults={loanDefaults} />
            <p className="mt-6 text-xs leading-relaxed text-stone">
              These calculations are estimates only. Actual rates, fees and loan
              approval depend on the financial institution and the applicant&apos;s
              circumstances.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Document upload */}
      <section>
        <div className={`${shell} ${section}`}>
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-gold/20 bg-night-soft px-7 py-8">
              <div>
                <p className="font-display text-2xl text-paper">Already working with me?</p>
                <p className="mt-2 max-w-md text-sm text-paper/80">Upload your documents through your secure personal link.</p>
              </div>
              <Link href="/upload-documents" className="shrink-0 rounded-md border border-gold/50 px-6 py-3 text-sm font-medium text-gold-bright transition-colors hover:border-gold-bright">Upload Documents</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
