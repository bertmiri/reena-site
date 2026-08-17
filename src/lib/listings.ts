export const PROPERTY_TYPES = [
  "residential",
  "commercial",
  "industrial",
  "land",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  land: "Land",
};

export const LISTING_KINDS = ["sale", "rent"] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

export const LISTING_KIND_LABELS: Record<ListingKind, string> = {
  sale: "For Sale",
  rent: "For Rent",
};

export const LISTING_STATUSES = ["available", "sold", "hidden"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  available: "Available",
  sold: "Sold",
  hidden: "Hidden (draft)",
};

export function formatListingPrice(
  price: number | null,
  isFrom: boolean,
  kind: ListingKind
): string {
  if (price == null) return "Price on request";
  const formatted = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(price);
  const suffix = kind === "rent" ? " /month" : "";
  return `${isFrom ? "From " : ""}${formatted}${suffix}`;
}

/** URL-safe slug from a title, with a short random suffix for uniqueness. */
export function slugifyListing(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  for (const b of bytes) suffix += chars[b % chars.length];
  return `${base || "listing"}-${suffix}`;
}
