import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateUploadToken } from "@/lib/upload-requests";
import { sanitizeFilename, validateFile } from "@/lib/upload-validation";
import { notifySubmission } from "@/lib/email";

function clientIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

async function audit(
  action: string,
  clientId: string,
  documentId: string | null,
  metadata: Record<string, unknown>,
  ip: string | null
) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      user_id: null,
      action,
      client_id: clientId,
      document_id: documentId,
      metadata,
      ip_address: ip,
    });
  } catch (err) {
    console.error("[upload-api] audit failed:", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const valid = await validateUploadToken(token);
  if (!valid) {
    return NextResponse.json(
      { error: "This upload link is invalid, expired or revoked." },
      { status: 403 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const categoryId = String(form.get("category_id") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!valid.categories.some((c) => c.id === categoryId)) {
    return NextResponse.json(
      { error: "Unknown document category." },
      { status: 400 }
    );
  }

  const check = validateFile(file.name, file.type, file.size);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  const admin = createAdminClient();
  const documentId = randomUUID();
  const storagePath = `${valid.clientId}/${documentId}.${check.ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: storageError } = await admin.storage
    .from("client-documents")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
    });

  if (storageError) {
    console.error("[upload-api] storage failed:", storageError);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }

  const { error: dbError } = await admin.from("documents").insert({
    id: documentId,
    client_id: valid.clientId,
    category_id: categoryId,
    upload_request_id: valid.requestId,
    original_filename: sanitizeFilename(file.name),
    storage_path: storagePath,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
  });

  if (dbError) {
    console.error("[upload-api] insert failed:", dbError);
    await admin.storage.from("client-documents").remove([storagePath]);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }

  await admin
    .from("upload_request_documents")
    .update({ status: "uploaded" })
    .eq("upload_request_id", valid.requestId)
    .eq("document_category_id", categoryId);

  await admin
    .from("upload_requests")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", valid.requestId);

  await audit(
    "document_uploaded",
    valid.clientId,
    documentId,
    { request_id: valid.requestId, file_size: file.size },
    clientIp(req)
  );

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const valid = await validateUploadToken(token);
  if (!valid) {
    return NextResponse.json(
      { error: "This upload link is invalid, expired or revoked." },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const { count } = await admin
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("upload_request_id", valid.requestId);

  if (!count) {
    return NextResponse.json(
      { error: "Please upload at least one document first." },
      { status: 400 }
    );
  }

  await admin
    .from("upload_requests")
    .update({ status: "completed" })
    .eq("id", valid.requestId);

  await admin
    .from("clients")
    .update({ status: "documents_received" })
    .eq("id", valid.clientId)
    .in("status", ["new", "documents_requested"]);

  await audit(
    "upload_submitted",
    valid.clientId,
    null,
    { request_id: valid.requestId, document_count: count },
    clientIp(req)
  );

  await notifySubmission(
    { clientName: valid.clientName, reference: valid.reference, clientId: valid.clientId },
    count ?? 0
  );

  return NextResponse.json({
    ok: true,
    reference: valid.reference,
    documentCount: count,
  });
}
