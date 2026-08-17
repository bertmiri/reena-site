import {
  LISTING_KINDS,
  LISTING_KIND_LABELS,
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  type ListingKind,
  type ListingStatus,
  type PropertyType,
} from "@/lib/listings";

type Values = {
  title?: string;
  area?: string;
  property_type?: string;
  listing_kind?: string;
  price?: number | null;
  price_is_from?: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  toilets?: number | null;
  built_up_sqft?: number | null;
  land_sqft?: number | null;
  tenure?: string | null;
  description?: string | null;
  video_url?: string | null;
  status?: string;
  featured?: boolean;
};

const input =
  "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink focus:border-gold";
const label = "mb-1.5 block text-sm font-medium text-ink";

function num(v: number | null | undefined): string | number {
  return v == null ? "" : v;
}

export function ListingFields({ v = {} }: { v?: Values }) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="title" className={label}>Title *</label>
        <input id="title" name="title" required minLength={3} maxLength={140} defaultValue={v.title ?? ""} placeholder="e.g. Cosy 3-bed terrace in Luak" className={input} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="area" className={label}>Area / location *</label>
          <input id="area" name="area" required maxLength={120} defaultValue={v.area ?? ""} placeholder="e.g. Luak, Miri" className={input} />
        </div>
        <div>
          <label htmlFor="property_type" className={label}>Property type</label>
          <select id="property_type" name="property_type" defaultValue={v.property_type ?? "residential"} className={input}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t as PropertyType]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="listing_kind" className={label}>For</label>
          <select id="listing_kind" name="listing_kind" defaultValue={v.listing_kind ?? "sale"} className={input}>
            {LISTING_KINDS.map((k) => (
              <option key={k} value={k}>{LISTING_KIND_LABELS[k as ListingKind]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="price" className={label}>Price (RM)</label>
          <input id="price" name="price" type="number" min={0} step={1000} defaultValue={num(v.price)} placeholder="Leave blank for 'on request'" className={input} />
          <label className="mt-2 flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="price_is_from" defaultChecked={v.price_is_from} className="accent-[#8c7030]" />
            Show as &quot;From&quot; price
          </label>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="bedrooms" className={label}>Bedrooms</label>
          <input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={num(v.bedrooms)} className={input} />
        </div>
        <div>
          <label htmlFor="bathrooms" className={label}>Bathrooms</label>
          <input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={num(v.bathrooms)} className={input} />
        </div>
        <div>
          <label htmlFor="toilets" className={label}>Toilets</label>
          <input id="toilets" name="toilets" type="number" min={0} defaultValue={num(v.toilets)} className={input} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="built_up_sqft" className={label}>Built-up (sqft)</label>
          <input id="built_up_sqft" name="built_up_sqft" type="number" min={0} defaultValue={num(v.built_up_sqft)} className={input} />
        </div>
        <div>
          <label htmlFor="land_sqft" className={label}>Land (sqft)</label>
          <input id="land_sqft" name="land_sqft" type="number" min={0} defaultValue={num(v.land_sqft)} className={input} />
        </div>
        <div>
          <label htmlFor="tenure" className={label}>Tenure</label>
          <input id="tenure" name="tenure" maxLength={60} defaultValue={v.tenure ?? ""} placeholder="Freehold / Leasehold" className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={label}>Description (keep it short)</label>
        <textarea id="description" name="description" rows={3} maxLength={2000} defaultValue={v.description ?? ""} placeholder="A couple of lines — the key selling points." className={input} />
      </div>

      <div>
        <label htmlFor="video_url" className={label}>Video link (TikTok / Instagram) — optional</label>
        <input id="video_url" name="video_url" type="url" maxLength={300} defaultValue={v.video_url ?? ""} placeholder="https://…" className={input} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className={label}>Status</label>
          <select id="status" name="status" defaultValue={v.status ?? "available"} className={input}>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s}>{LISTING_STATUS_LABELS[s as ListingStatus]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="featured" defaultChecked={v.featured} className="accent-[#8c7030]" />
            Feature on homepage
          </label>
        </div>
      </div>
    </div>
  );
}
