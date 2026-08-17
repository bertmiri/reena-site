import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB per photo
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", id)
    .single();
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Images only (JPG, PNG, WEBP, HEIC)." }, { status: 400 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Each photo must be under 10 MB." }, { status: 400 });
  }

  const { count } = await supabase
    .from("listing_photos")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", id);

  const path = `${id}/${randomUUID()}.${EXT[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("listing-photos")
    .upload(path, buffer, { contentType: file.type });
  if (upErr) {
    console.error("[listing-photos] upload failed:", upErr);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  const { data: row, error: dbErr } = await supabase
    .from("listing_photos")
    .insert({ listing_id: id, storage_path: path, sort_order: count ?? 0 })
    .select("id")
    .single();
  if (dbErr || !row) {
    await supabase.storage.from("listing-photos").remove([path]);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from("listing-photos").getPublicUrl(path);
  return NextResponse.json({ ok: true, id: row.id, url: pub.publicUrl });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photoId = z.uuid().safeParse(req.nextUrl.searchParams.get("photo"));
  if (!z.uuid().safeParse(id).success || !photoId.success) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: photo } = await supabase
    .from("listing_photos")
    .select("storage_path")
    .eq("id", photoId.data)
    .eq("listing_id", id)
    .single();
  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await supabase.storage.from("listing-photos").remove([photo.storage_path]);
  await supabase.from("listing_photos").delete().eq("id", photoId.data);

  return NextResponse.json({ ok: true });
}
