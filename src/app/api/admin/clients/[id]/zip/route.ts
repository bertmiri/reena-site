import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildClientZip } from "@/lib/zip";
import { logAudit } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
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

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("id", id)
    .single();
  if (!client) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: docs } = await supabase
    .from("documents")
    .select(
      "id, original_filename, storage_path, file_size, document_categories:category_id(name)"
    )
    .eq("client_id", id);

  const result = await buildClientZip(client.full_name, docs ?? []);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await logAudit({
    action: "zip_downloaded",
    clientId: client.id,
    metadata: { file_count: result.fileCount },
  });

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Content-Length": String(result.buffer.byteLength),
    },
  });
}
