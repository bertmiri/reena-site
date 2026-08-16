-- ============================================================
-- Listings feature — curated property listings (agent-owned content)
-- Public-readable (these appear on the public website).
-- Only the authenticated admin can write.
-- ============================================================

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  area text not null,
  property_type text not null default 'residential'
    check (property_type in ('residential','commercial','industrial','land')),
  listing_kind text not null default 'sale'
    check (listing_kind in ('sale','rent')),
  price numeric(14,2),
  price_is_from boolean not null default false,
  bedrooms int,
  bathrooms int,
  toilets int,
  built_up_sqft int,
  land_sqft int,
  tenure text,
  description text,
  video_url text,
  status text not null default 'available'
    check (status in ('available','sold','hidden')),
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_status_idx on public.listings (status);
create index listings_type_idx on public.listings (property_type);
create index listings_featured_idx on public.listings (featured) where featured;
create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index listing_photos_listing_idx on public.listing_photos (listing_id);

alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;

create policy "public_read_listings" on public.listings
  for select to anon, authenticated
  using (status <> 'hidden');

create policy "public_read_listing_photos" on public.listing_photos
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status <> 'hidden'
    )
  );

create policy "admin_all_listings" on public.listings
  for all to authenticated using (true) with check (true);
create policy "admin_all_listing_photos" on public.listing_photos
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "public_read_listing_photo_objects" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'listing-photos');

create policy "admin_write_listing_photo_objects" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-photos');

create policy "admin_update_listing_photo_objects" on storage.objects
  for update to authenticated
  using (bucket_id = 'listing-photos');

create policy "admin_delete_listing_photo_objects" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-photos');

insert into public.website_settings (key, value)
values ('listings_enabled', 'false')
on conflict (key) do nothing;
