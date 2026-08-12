"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

const deleteSchema = z.object({
  documentId: z.uuid(),
  clientId: z.uuid(),
});

export async function deleteDocument(formData: FormData) {
  const parsed = deleteSchema.safeParse({
    documentId: formData.get("document_id"),
    clientId: formData.get("client_id"),
  });
  if (!parsed.success) {
    redirect("/admin/clients");
  }

  const back = `/admin/clients/${parsed.data.clientId}`;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("id, client_id, storage_path, original_filename")
    .eq("id", parsed.data.documentId)
    .single();

  if (!doc || doc.client_id !== parsed.data.clientId) {
    redirect(`${back}?error=Document+not+found`);
  }

  const admin = createAdminClient();
  const { error: storageError } = await admin.storage
    .from("client-documents")
    .remove([doc.storage_path]);
  if (storageError) {
    console.error("[documents] storage delete failed:", storageError);
  }

  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("id", doc.id);
  if (dbError) {
    console.error("[documents] row delete failed:", dbError);
    redirect(`${back}?error=Could+not+delete+document`);
  }

  await logAudit({
    action: "document_deleted",
    clientId: doc.client_id,
    documentId: doc.id,
    metadata: { filename: doc.original_filename },
  });
  revalidatePath(back);
  redirect(back);
}
