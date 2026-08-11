import { createClient } from "@/lib/supabase/server";
import { CreateUploadRequestForm } from "./create-upload-request-form";
import { revokeUploadRequest } from "./upload-request-actions";

export async function UploadRequestsSection({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const supabase = await createClient();

  const [{ data: categories }, { data: requests }] = await Promise.all([
    supabase
      .from("document_categories")
      .select("id, name")
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("upload_requests")
      .select(
        "id, status, expires_at, created_at, last_used_at, upload_request_documents(document_categories(name))"
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <section className="mt-12 rounded-lg border border-sand bg-white/50 px-5 py-6">
      <h2 className="font-display text-xl text-ink">Upload Links</h2>
      <p className="mt-1 text-sm text-stone">
        Create a secure link for {clientName} to upload documents — no account
        needed on their side.
      </p>

      <div className="mt-5">
        <CreateUploadRequestForm
          clientId={clientId}
          clientName={clientName}
          categories={categories ?? []}
        />
      </div>

      {(requests ?? []).length > 0 && (
        <ul className="mt-6 space-y-3">
          {(requests ?? []).map((r) => {
            const expired =
              r.status === "active" && new Date(r.expires_at) < new Date();
            const label =
              r.status === "revoked"
                ? "Revoked"
                : r.status === "completed"
                  ? "Completed"
                  : expired
                    ? "Expired"
                    : "Active";
            const cats = (r.upload_request_documents ?? [])
              .map((d) => d.document_categories?.name)
              .filter(Boolean)
              .join(", ");
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-sand bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="text-ink">
                    <span
                      className={
                        label === "Active"
                          ? "font-medium text-gold-deep"
                          : "font-medium text-stone"
                      }
                    >
                      {label}
                    </span>{" "}
                    · expires{" "}
                    {new Date(r.expires_at).toLocaleDateString("en-MY")}
                  </p>
                  <p className="mt-0.5 text-xs text-stone">{cats}</p>
                </div>
                {label === "Active" && (
                  <form action={revokeUploadRequest}>
                    <input type="hidden" name="request_id" value={r.id} />
                    <input type="hidden" name="client_id" value={clientId} />
                    <button
                      type="submit"
                      className="text-xs text-stone transition-colors hover:text-hibiscus-deep"
                    >
                      Revoke Link
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
