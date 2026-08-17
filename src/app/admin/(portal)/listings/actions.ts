"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import {
  LISTING_KINDS,
  LISTING_STATUSES,
  PROPERTY_TYPES,
  slugifyListing,
} from "@/lib/listings";

const BACK = "/admin/listings";

const optionalInt = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v == null ? null : Number(v)))
  .refine((v) => v == null || (Number.isFinite(v) && v >= 0), "invalid")
  .nullable();

const optionalPrice = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v == null ? null : Number(v)))
  .refine((v) => v == null || (Number.isFinite(v) && v >= 0), "invalid")
  .nullable();

const fields = z.object({
  title: z.string().trim().min(3).max(140),
  area: z.string().trim().min(2).max(120),
  property_type: z.enum(PROPERTY_TYPES),
  listing_kind: z.enum(LISTING_KINDS),
  price: optionalPrice,
  price_is_from: z.boolean(),
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  toilets: optionalInt,
  built_up_sqft: optionalInt,
  land_sqft: optionalInt,
  tenure: z.string().trim().max(60).default(""),
  description: z.string().trim().max(2000).default(""),
  video_url: z
    .union([z.literal(""), z.url().max(300)])
    .transform((v) => (v === "" ? null : v)),
  status: z.enum(LISTING_STATUSES),
  featured: z.boolean(),
});

function parseForm(formData: FormData) {
  return fields.safeParse({
    title: formData.get("title") ?? "",
    area: formData.get("area") ?? "",
    property_type: formData.get("property_type") ?? "residential",
    listing_kind: formData.get("listing_kind") ?? "sale",
    price: formData.get("price") ?? "",
    price_is_from: formData.get("price_is_from") === "on",
    bedrooms: formData.get("bedrooms") ?? "",
    bathrooms: formData.get("bathrooms") ?? "",
    toilets: formData.get("toilets") ?? "",
    built_up_sqft: formData.get("built_up_sqft") ?? "",
    land_sqft: formData.get("land_sqft") ?? "",
    tenure: formData.get("tenure") ?? "",
    description: formData.get("description") ?? "",
    video_url: formData.get("video_url") ?? "",
    status: formData.get("status") ?? "available",
    featured: formData.get("featured") === "on",
  });
}

export async function createListing(formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    redirect(`${BACK}/new?error=invalid`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({ ...parsed.data, slug: slugifyListing(parsed.data.title) })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[listings] create failed:", error);
    redirect(`${BACK}/new?error=save`);
  }

  await logAudit({ action: "listing_created", metadata: { title: parsed.data.title } });
  revalidatePath(BACK);
  revalidatePath("/listings");
  redirect(`${BACK}/${data.id}?created=1`);
}

export async function updateListing(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(BACK);

  const parsed = parseForm(formData);
  if (!parsed.success) {
    redirect(`${BACK}/${id.data}?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update(parsed.data)
    .eq("id", id.data);

  if (error) {
    console.error("[listings] update failed:", error);
    redirect(`${BACK}/${id.data}?error=save`);
  }

  await logAudit({ action: "listing_updated", metadata: { id: id.data } });
  revalidatePath(BACK);
  revalidatePath("/listings");
  revalidatePath(`/listings`);
  redirect(`${BACK}/${id.data}?saved=1`);
}

export async function deleteListing(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect(BACK);

  const supabase = await createClient();

  // Remove photos from storage first (best-effort).
  const { data: photos } = await supabase
    .from("listing_photos")
    .select("storage_path")
    .eq("listing_id", id.data);
  if (photos && photos.length > 0) {
    await supabase.storage
      .from("listing-photos")
      .remove(photos.map((p) => p.storage_path));
  }

  const { error } = await supabase.from("listings").delete().eq("id", id.data);
  if (error) {
    console.error("[listings] delete failed:", error);
    redirect(`${BACK}/${id.data}?error=save`);
  }

  await logAudit({ action: "listing_deleted", metadata: { id: id.data } });
  revalidatePath(BACK);
  revalidatePath("/listings");
  redirect(`${BACK}?deleted=1`);
}
