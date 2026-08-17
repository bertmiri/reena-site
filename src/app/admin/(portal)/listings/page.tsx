import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LISTING_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  formatListingPrice,
  type ListingKind,
  type ListingStatus,
  type PropertyType,
} from "@/lib/listings";

export const metadata = {
  title: "Listings",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  created: "Listing created.",
  saved: "Listing saved.",
  deleted: "Listing deleted.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; saved?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  const flash = MESSAGES[sp.created ? "created" : sp.saved ? "saved" : sp.deleted ? "deleted" : ""];

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, area, property_type, listing_kind, price, price_is_from, status, featured, created_at")
    .order("sort_order")
    .order("created_at", { ascending: false });

  const rows = listings ?? [];
  const badge = "inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Listings</h1>
          <div className="thread-divider mt-3 w-24" />
        </div>
        <Link href="/admin/listings/new" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">+ Add Listing</Link>
      </div>

      {flash && (
        <p className="mt-6 rounded-md border border-gold/40 bg-champagne/50 px-3.5 py-2.5 text-sm text-ink">{flash}</p>
      )}

      {rows.length === 0 ? (
        <div className="mt-12 rounded-lg border border-sand bg-white/50 px-6 py-12 text-center">
          <p className="text-ink">No listings yet.</p>
          <p className="mt-1 text-sm text-stone">Add your first property to start building your listings page.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((l) => (
            <Link key={l.id} href={`/admin/listings/${l.id}`} className="block rounded-lg border border-sand bg-white/60 px-4 py-3 transition-colors hover:border-gold">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{l.title}</p>
                  <p className="text-xs text-stone">
                    {l.area} · {PROPERTY_TYPE_LABELS[l.property_type as PropertyType]} ·{" "}
                    {formatListingPrice(l.price, l.price_is_from, l.listing_kind as ListingKind)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {l.featured && <span className={`${badge} bg-gold/20 text-gold-deep`}>Featured</span>}
                  <span
                    className={
                      l.status === "available"
                        ? `${badge} bg-champagne/70 text-ink`
                        : l.status === "sold"
                          ? `${badge} bg-hibiscus/10 text-hibiscus-deep`
                          : `${badge} bg-sand text-stone`
                    }
                  >
                    {LISTING_STATUS_LABELS[l.status as ListingStatus]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
