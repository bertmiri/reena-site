import { createClient } from "@/lib/supabase/server";
import { DeleteDocumentButton } from "./delete-document-button";

function sizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function DocumentsSection({ clientId }: { clientId: string }) {
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("documents")
    .select(
      "id, original_filename, file_size, uploaded_at, document_categories:category_id(name)"
    )
    .eq("client_id", clientId)
    .order("uploaded_at", { ascending: false });

  const documents = docs ?? [];

  const groups = new Map<string, typeof documents>();
  for (const d of documents) {
    const cat = Array.isArray(d.document_categories)
      ? d.document_categories[0]
      : d.document_categories;
    const name = cat?.name ?? "Uncategorised";
    groups.set(name, [...(groups.get(name) ?? []), d]);
  }

  const linkClass = "text-xs text-ink hover:text-gold-deep";

  return (
    <section className="mt-6 rounded-lg border border-sand bg-white/50 px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">Documents</h2>
        {documents.length > 0 && (
          <a href={`/api/admin/clients/${clientId}/zip`} className="rounded-md border border-sand px-3 py-1.5 text-xs text-ink transition-colors hover:border-gold">Download All (.zip)</a>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="mt-2 text-sm text-stone">
          No documents yet. Create an upload link above to start collecting.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          {[...groups.entries()].map(([category, files]) => (
            <div key={category}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-gold-deep">
                {category}
              </h3>
              <ul className="mt-2 space-y-2">
                {files.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-sand bg-white px-4 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink">✓ {d.original_filename}</p>
                      <p className="text-xs text-stone">
                        {sizeLabel(d.file_size)} ·{" "}
                        {new Date(d.uploaded_at).toLocaleDateString("en-MY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <a href={`/api/admin/documents/${d.id}/download?mode=view`} target="_blank" rel="noopener" className={linkClass}>View</a>
                      <a href={`/api/admin/documents/${d.id}/download`} className={linkClass}>Download</a>
                      <DeleteDocumentButton documentId={d.id} clientId={clientId} filename={d.original_filename} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
