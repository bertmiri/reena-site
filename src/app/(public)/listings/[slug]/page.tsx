import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";
import {
  PROPERTY_TYPE_LABELS,
  LISTING_KIND_LABELS,
  formatListingPrice,
  type ListingKind,
  type PropertyType,
} from "@/lib/listings";
import { listingsVisible } from "@/lib/listings-public";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("listings").select("title, area").eq("slug", slug).single();
  return {
    title: data ? `${data.title} — ${data.area}` : "Property",
  };
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gold/15 py-3">
      <dt className="text-xs uppercase tracking-wide text-mist">{label}</dt>
      <dd className="mt-0.5 text-paper">{value}</dd>
    </div>
  );
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { visible } = await listingsVisible();
  if (!visible) notFound();

  const { slug } = await params;
  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("*, listing_photos(storage_path, sort_order)")
    .eq("slug", slug)
    .single();

  if (!listing || listing.status === "hidden") notFound();

  const settings = await getSiteSettings();
  const photos = (listing.listing_photos ?? [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((p: { storage_path: string }) => admin.storage.from("listing-photos").getPublicUrl(p.storage_path).data.publicUrl);

  const specs: { label: string; value: string }[] = [];
  specs.push({ label: "Type", value: PROPERTY_TYPE_LABELS[listing.property_type as PropertyType] });
  specs.push({ label: "For", value: LISTING_KIND_LABELS[listing.listing_kind as ListingKind] });
  if (listing.bedrooms != null) specs.push({ label: "Bedrooms", value: String(listing.bedrooms) });
  if (listing.bathrooms != null) specs.push({ label: "Bathrooms", value: String(listing.bathrooms) });
  if (listing.toilets != null) specs.push({ label: "Toilets", value: String(listing.toilets) });
  if (listing.built_up_sqft != null) specs.push({ label: "Built-up", value: `${listing.built_up_sqft} sqft` });
  if (listing.land_sqft != null) specs.push({ label: "Land", value: `${listing.land_sqft} sqft` });
  if (listing.tenure) specs.push({ label: "Tenure", value: listing.tenure });

  const waText = `Hi Reena, I'm interested in "${listing.title}" (${listing.area}). Is it still available?`;

  return (
    <main className="bg-night text-paper">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/listings" className="text-sm text-paper hover:text-gold-bright">← All properties</Link>

        {photos.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="overflow-hidden rounded-lg sm:row-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[0]} alt={listing.title} className="h-full w-full object-cover" />
            </div>
            {photos.slice(1, 5).map((url: string, i: number) => (
              <div key={i} className="overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex aspect-[16/9] items-center justify-center rounded-lg border border-gold/20 bg-night-soft text-mist">No photos yet</div>
        )}

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
          <div>
            {listing.status === "sold" && (
              <span className="mb-3 inline-block rounded bg-hibiscus-deep px-2.5 py-1 text-xs font-semibold text-paper">SOLD</span>
            )}
            <h1 className="font-display text-4xl text-paper">{listing.title}</h1>
            <p className="mt-2 text-paper">{listing.area}</p>
            <p className="mt-4 font-display text-3xl text-gold-bright">
              {formatListingPrice(listing.price, listing.price_is_from, listing.listing_kind as ListingKind)}
            </p>

            {listing.description && (
              <p className="mt-6 leading-relaxed text-paper">{listing.description}</p>
            )}

            <dl className="mt-8 grid gap-x-8 sm:grid-cols-2">
              {specs.map((s) => (
                <Spec key={s.label} label={s.label} value={s.value} />
              ))}
            </dl>

            {listing.video_url && (
              <p className="mt-8">
                <a href={listing.video_url} target="_blank" rel="noopener" className="inline-block rounded-md border border-gold/50 px-5 py-2.5 text-sm font-medium text-gold-bright transition-colors hover:border-gold-bright">▶ Watch the video tour</a>
              </p>
            )}
          </div>

          <aside className="md:sticky md:top-6 md:self-start">
            <div className="rounded-lg border border-gold/25 bg-night-soft px-6 py-6 text-center">
              <p className="font-display text-xl text-paper">Interested?</p>
              <p className="mt-1 text-sm text-paper">Contact {settings.agent_name} directly.</p>
              <a href={whatsappLink(settings, waText)} target="_blank" rel="noopener" className="mt-5 block rounded-md bg-gold px-5 py-3 font-semibold text-night transition-colors hover:bg-gold-bright">WhatsApp about this property</a>
              <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="mt-2 block rounded-md border border-gold/40 px-5 py-3 text-sm font-medium text-gold-bright transition-colors hover:border-gold-bright">Call {settings.phone}</a>
              <p className="mt-4 text-xs text-mist">{settings.agent_name} · {settings.ren}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
