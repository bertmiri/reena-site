"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { EXPIRY_OPTIONS, generateUploadToken } from "@/lib/upload-tokens";

export type CreateUploadRequestState = {
  error?: string;
  link?: string;
  expiresAt?: string;
};

const createSchema = z.object({
  clientId: z.uuid(),
  expiryDays: z.coerce
    .number()
    .refine((d): d is (typeof EXPIRY_OPTIONS)[number] =>
      (EXPIRY_OPTIONS as readonly number[]).includes(d)
    ),
  message: z.string().trim().max(500).default(""),
  categoryIds: z.array(z.uuid()).min(1),
});

export async function createUploadRequest(
  _prev: CreateUploadRequestState,
  formData: FormData
): Promise<CreateUploadRequestState> {
  const parsed = createSchema.safeParse({
    clientId: formData.get("client_id"),
    expiryDays: formData.get("expiry_days"),
    message: formData.get("message") ?? "",
    categoryIds: formData.getAll("category_ids").map(String),
  });
  if (!parsed.success) {
    return { error: "Select at least one document category." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated." };
  }

  const { raw, hash } = generateUploadToken();
  const expiresAt = new Date(
    Date.now() + parsed.data.expiryDays * 24 * 60 * 60 * 1000
  );

  const { data: request, error } = await supabase
    .from("upload_requests")
    .insert({
      client_id: parsed.data.clientId,
      token_hash: hash,
      message: parsed.data.message || null,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error || !request) {
    console.error("[upload-requests] create failed:", error);
    return { error: "Could not create the upload link." };
  }

  const categoryRows = parsed.data.categoryIds.map((categoryId) => ({
    upload_request_id: request.id,
    document_category_id: categoryId,
  }));
  const { error: catError } = await supabase
    .from("upload_request_documents")
    .insert(categoryRows);

  if (catError) {
    console.error("[upload-requests] categories failed:", catError);
    await supabase.from("upload_requests").delete().eq("id", request.id);
    return { error: "Could not create the upload link." };
  }

  await supabase
    .from("clients")
    .update({ status: "documents_requested" })
    .eq("id", parsed.data.clientId)
    .eq("status", "new");

  await logAudit({
    action: "upload_link_created",
    clientId: parsed.data.clientId,
    metadata: { request_id: request.id, expires_at: expiresAt.toISOString() },
  });
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    link: `${base}/upload/${raw}`,
    expiresAt: expiresAt.toISOString(),
  };
}

const revokeSchema = z.object({
  requestId: z.uuid(),
  clientId: z.uuid(),
});

export async function revokeUploadRequest(formData: FormData) {
  const parsed = revokeSchema.safeParse({
    requestId: formData.get("request_id"),
    clientId: formData.get("client_id"),
  });
  if (!parsed.success) {
    redirect("/admin/clients");
  }

  const back = `/admin/clients/${parsed.data.clientId}`;
  const supabase = await createClient();
  const { error } = await supabase
    .from("upload_requests")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", parsed.data.requestId)
    .eq("status", "active");

  if (error) {
    console.error("[upload-requests] revoke failed:", error);
    redirect(`${back}?error=Could+not+revoke+the+link`);
  }

  await logAudit({
    action: "upload_link_revoked",
    clientId: parsed.data.clientId,
    metadata: { request_id: parsed.data.requestId },
  });
  revalidatePath(back);
  redirect(back);
}
