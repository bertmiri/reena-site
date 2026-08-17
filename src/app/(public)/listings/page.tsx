import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  formatListingPrice,
  type ListingKind,
  type PropertyType,
} from "@/lib/listings";
import {
  fetchPublicListings,
  listingsVisible,
} from "@/lib/listings-public";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse property listings with Reena Mazlan — RM Property Hub, Miri.",
};

export const dynamic = "force-dynamic";

export default async function PublicListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; area?: string; maxPrice?: string; minBeds?: string }>;
}) {
  const { visible, preview } = await listingsVisible();
  if (!visible) notFound();

  const sp = await searchParams;
  const filters = {
    type: sp.type || undefined,
    area: sp.area || undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    minBeds: sp.minBeds ? Number(sp.minBeds) : undefined,
  };
  const listings = await fetchPublicListings(filters);

  const field =
    "rounded-md border border-gold/25 bg-night-soft px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:border-gold";

  return (
    <main className="bg-night text-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {preview && (
          <p className="mb-6 rounded-md border border-gold/40 bg-gold/10 px-4 py-2.5 text-center text-sm text-gold-bright">
            Preview — your listings page is hidden from the public. Turn it on in Website settings when ready.
          </p>
        )}

        <div className="text-center">
          <p className="text-xs tracking-[0.25em] text-gold-bright">PROPERTIES</p>
          <h1 className="mt-3 font-display text-4xl text-paper">Find your next home</h1>
          <div className="thread-divider mx-auto mt-5 w-24 opacity-70" />
        </div>

        <form method="get" className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <select name="type" defaultValue={filters.type ?? ""} className={field}>
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t as PropertyType]}</option>
            ))}
          </select>
          <input name="area" defaultValue={filters.area ?? ""} placeholder="Area" className={field} />
          <input name="maxPrice" type="number" min={0} step={50000} defaultValue={filters.maxPrice ?? ""} placeholder="Max price" className={field} />
          <input name="minBeds" type="number" min={0} defaultValue={filters.minBeds ?? ""} placeholder="Min beds" className={field} />
          <button type="submit" className="col-span-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-night transition-colors hover:bg-gold-bright sm:col-span-4">Search</button>
          {(filters.type || filters.area || filters.maxPrice || filters.minBeds) && (
            <Link href="/listings" className="col-span-2 text-center text-sm text-paper/70 hover:text-gold-bright sm:col-span-4">Clear filters</Link>
          )}
        </form>

        {listings.length === 0 ? (
          <p className="mt-16 text-center text-paper/70">No properties match your search right now.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <Link key={l.id} href={`/listings/${l.slug}`} style={{ animationDelay: `${i * 60}ms` }} className="rm-rise group block overflow-hidden rounded-lg border border-gold/20 bg-night-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50">
                <div className="relative aspect-[4/3] overflow-hidden bg-night">
                  {l.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.cover_url} alt={l.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-paper/30">No photo</div>
                  )}
                  {l.status === "sold" && (
                    <span className="absolute left-3 top-3 rounded bg-hibiscus-deep px-2.5 py-1 text-xs font-semibold text-paper">SOLD</span>
                  )}
                </div>
                <div className="space-y-1 px-5 py-5">
                  <p className="font-display text-xl text-gold-bright">
                    {formatListingPrice(l.price, l.price_is_from, l.listing_kind as ListingKind)}
                  </p>
                  <p className="font-medium text-paper">{l.title}</p>
                  <p className="text-sm text-paper/70">{l.area}</p>
                  <p className="pt-1 text-xs text-paper/70">
                    {[
                      l.bedrooms != null ? `${l.bedrooms} bed` : null,
                      l.bathrooms != null ? `${l.bathrooms} bath` : null,
                      l.built_up_sqft != null ? `${l.built_up_sqft} sqft` : null,
                    ].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
