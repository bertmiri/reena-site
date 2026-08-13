import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildZip, type ClientGroup, type DocRow } from "@/lib/zip";
import { logAudit } from "@/lib/audit";

function backWithError(req: NextRequest, message: string) {
  const url = new URL("/admin/clients", req.nextUrl.origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}




export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return backWithError(req, "Invalid export request.");
  }

  const scope = form.get("scope") === "all" ? "all" : "selected";
  const idsParsed = z
    .array(z.uuid())
    .max(200)
    .safeParse(form.getAll("client_ids").map(String));

  if (scope === "selected" && (!idsParsed.success || idsParsed.data.length === 0)) {
    return backWithError(req, "Select at least one client first.");
  }

  let clientsQuery = supabase.from("clients").select("id, full_name");
  if (scope === "selected" && idsParsed.success) {
    clientsQuery = clientsQuery.in("id", idsParsed.data);
  }
  const { data: clients } = await clientsQuery;
  if (!clients || clients.length === 0) {
    return backWithError(req, "No matching clients found.");
  }

  const { data: docs } = await supabase
    .from("documents")
    .select(
      "id, client_id, original_filename, storage_path, file_size, document_categories:category_id(name)"
    )
    .in(
      "client_id",
      clients.map((c) => c.id)
    );

  const byClient = new Map<string, DocRow[]>();
  for (const d of docs ?? []) {
    const list = byClient.get(d.client_id) ?? [];
    list.push(d);
    byClient.set(d.client_id, list);
  }

  const groups: ClientGroup[] = clients
    .map((c) => ({ clientName: c.full_name, docs: byClient.get(c.id) ?? [] }))
    .filter((g) => g.docs.length > 0);

  const today = new Date().toISOString().slice(0, 10);
  const result = await buildZip(groups, `Client_Documents_${today}.zip`);
  if (!result.ok) {
    return backWithError(req, result.error);
  }

  await logAudit({
    action: "multi_zip_exported",
    metadata: {
      scope,
      client_count: groups.length,
      file_count: result.fileCount,
    },
  });

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Content-Length": String(result.buffer.byteLength),
    },
  });
}
