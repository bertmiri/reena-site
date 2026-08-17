import Link from "next/link";
import { createListing } from "../actions";
import { ListingFields } from "../listing-fields";

export const metadata = {
  title: "Add Listing",
  robots: { index: false, follow: false },
};

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/listings" className="text-sm text-stone hover:text-ink">← All listings</Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Add Listing</h1>
      <div className="thread-divider mt-3 w-24" />

      <p className="mt-4 text-sm text-stone">
        Save the details first — you can add photos on the next step.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {error === "save" ? "Could not save. Please try again." : "Please check the required fields (title and area)."}
        </p>
      )}

      <form action={createListing} className="mt-8">
        <ListingFields />
        <div className="mt-8 flex items-center gap-4">
          <button type="submit" className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">Save & Add Photos</button>
          <Link href="/admin/listings" className="text-sm text-stone hover:text-ink">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
