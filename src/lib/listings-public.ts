import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PublicListing = {
  id: string;
  slug: string;
  title: string;
  area: string;
  property_type: string;
  listing_kind: string;
  price: number | null;
  price_is_from: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  built_up_sqft: number | null;
  status: string;
  cover_url: string | null;
};

/** Listings are public only when the site toggle is on — but a logged-in
 *  admin can always preview. Returns whether the viewer may see the page. */
export async function listingsVisible(): Promise<{ visible: boolean; preview: boolean }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("website_settings")
    .select("value")
    .eq("key", "listings_enabled")
    .single();
  const enabled = data?.value === true || data?.value === "true";

  if (enabled) return { visible: true, preview: false };

  // Not enabled publicly — allow only if an admin is logged in (preview).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { visible: Boolean(user), preview: Boolean(user) };
}

export type ListingFilters = {
  type?: string;
  area?: string;
  maxPrice?: number;
  minBeds?: number;
};

export async function fetchPublicListings(
  filters: ListingFilters = {}
): Promise<PublicListing[]> {
  const admin = createAdminClient();
  let query = admin
    .from("listings")
    .select(
      "id, slug, title, area, property_type, listing_kind, price, price_is_from, bedrooms, bathrooms, built_up_sqft, status, listing_photos(storage_path, sort_order)"
    )
    .neq("status", "hidden")
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (filters.type) query = query.eq("property_type", filters.type);
  if (filters.area) query = query.ilike("area", `%${filters.area}%`);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.minBeds) query = query.gte("bedrooms", filters.minBeds);

  const { data } = await query;

  return (data ?? []).map((l) => {
    const photos = (l.listing_photos ?? []).sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    const cover = photos[0]
      ? admin.storage.from("listing-photos").getPublicUrl(photos[0].storage_path).data.publicUrl
      : null;
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      area: l.area,
      property_type: l.property_type,
      listing_kind: l.listing_kind,
      price: l.price,
      price_is_from: l.price_is_from,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      built_up_sqft: l.built_up_sqft,
      status: l.status,
      cover_url: cover,
    };
  });
}
