import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateListing, deleteListing } from "../actions";
import { ListingFields } from "../listing-fields";
import { PhotoManager } from "../photo-manager";

export const metadata = {
  title: "Edit Listing",
  robots: { index: false, follow: false },
};

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, created, error } = await searchParams;

  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();
  if (!listing) notFound();

  const { data: photoRows } = await supabase
    .from("listing_photos")
    .select("id, storage_path")
    .eq("listing_id", id)
    .order("sort_order");

  const photos = (photoRows ?? []).map((p) => ({
    id: p.id,
    url: supabase.storage.from("listing-photos").getPublicUrl(p.storage_path).data.publicUrl,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/listings" className="text-sm text-stone hover:text-ink">← All listings</Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Edit Listing</h1>
      <div className="thread-divider mt-3 w-24" />

      {(saved || created) && (
        <p className="mt-6 rounded-md border border-gold/40 bg-champagne/50 px-3.5 py-2.5 text-sm text-ink">
          {created ? "Listing created — now add some photos below." : "Changes saved."}
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {error === "save" ? "Could not save. Please try again." : "Please check the required fields."}
        </p>
      )}

      <div className="mt-8 rounded-lg border border-sand bg-white/50 px-5 py-6">
        <PhotoManager listingId={listing.id} initialPhotos={photos} />
      </div>

      <form action={updateListing} className="mt-8">
        <input type="hidden" name="id" value={listing.id} />
        <ListingFields v={listing} />
        <div className="mt-8 flex items-center gap-4">
          <button type="submit" className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">Save Changes</button>
          <Link href="/admin/listings" className="text-sm text-stone hover:text-ink">Cancel</Link>
        </div>
      </form>

      <form action={deleteListing} className="mt-10 border-t border-sand pt-6">
        <input type="hidden" name="id" value={listing.id} />
        <button type="submit" className="text-sm text-stone transition-colors hover:text-hibiscus-deep">Delete this listing</button>
      </form>
    </div>
  );
}
