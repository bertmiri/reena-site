import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // 1. Verify session (this route is outside the proxy matcher on purpose —
  //    it must protect itself).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // 2. Fetch the document through the session client (RLS enforced).
  const { data: doc } = await supabase
    .from("documents")
    .select("id, client_id, storage_path, original_filename")
    .eq("id", id)
    .single();
  if (!doc) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // 3. Short-lived signed URL; attachment for download, inline for view.
  const mode = req.nextUrl.searchParams.get("mode") === "view" ? "view" : "download";
  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from("client-documents")
    .createSignedUrl(
      doc.storage_path,
      60,
      mode === "download" ? { download: doc.original_filename } : undefined
    );

  if (error || !signed?.signedUrl) {
    console.error("[download] signing failed:", error);
    return NextResponse.json({ error: "Could not prepare file." }, { status: 500 });
  }

  await logAudit({
    action: mode === "download" ? "document_downloaded" : "document_viewed",
    clientId: doc.client_id,
    documentId: doc.id,
  });

  return NextResponse.redirect(signed.signedUrl);
}
