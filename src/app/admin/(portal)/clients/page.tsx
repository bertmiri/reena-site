import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, type ClientStatus } from "@/lib/clients";

export const metadata = {
  title: "Clients",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

function sanitizeSearch(q: string) {
  return q.replace(/[%,()]/g, "").trim().slice(0, 80);
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; error?: string }>;
}) {
  const { q = "", page = "1", error } = await searchParams;
  const search = sanitizeSearch(q);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select(
      "id, full_name, email, phone, application_reference, status, created_at",
      { count: "exact" }
    );
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,application_reference.ilike.%${search}%`
    );
  }
  const { data: clients, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = clients ?? [];

  const badge =
    "inline-block rounded-full bg-champagne/70 px-2.5 py-0.5 text-xs text-ink";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Clients</h1>
          <div className="thread-divider mt-3 w-24" />
        </div>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          + Add Client
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {error}
        </p>
      )}

      <form method="get" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search name, email, phone or reference"
          className="w-full max-w-md rounded-md border border-sand bg-white px-3.5 py-2 text-sm text-ink placeholder:text-stone/60 focus:border-gold"
        />
        <button
          type="submit"
          className="rounded-md border border-sand px-4 py-2 text-sm text-ink transition-colors hover:border-gold"
        >
          Search
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="mt-12 rounded-lg border border-sand bg-white/50 px-6 py-12 text-center">
          <p className="text-ink">
            {search ? "No clients match your search." : "No clients yet."}
          </p>
          {!search && (
            <p className="mt-1 text-sm text-stone">
              Create your first client to start collecting documents.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 desktop-only overflow-hidden rounded-lg border border-sand">
            <table className="w-full bg-white/60 text-left text-sm">
              <thead className="border-b border-sand text-xs uppercase tracking-wide text-stone">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-sand/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="font-medium text-ink hover:text-gold-deep"
                      >
                        {c.full_name}
                      </Link>
                      <p className="text-xs text-stone">{c.email ?? c.phone ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{c.application_reference}</td>
                    <td className="px-4 py-3">
                      <span className={badge}>{STATUS_LABELS[c.status as ClientStatus]}</span>
                    </td>
                    <td className="px-4 py-3 text-stone">
                      {new Date(c.created_at).toLocaleDateString("en-MY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {rows.map((c) => (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="block rounded-lg border border-sand bg-white/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-ink">{c.full_name}</p>
                  <span className={badge}>{STATUS_LABELS[c.status as ClientStatus]}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-stone">{c.application_reference}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-stone">
            <p>
              {total} client{total === 1 ? "" : "s"}
            </p>
            <div className="flex gap-3">
              {pageNum > 1 && (
                <Link
                  href={`/admin/clients?q=${encodeURIComponent(search)}&page=${pageNum - 1}`}
                  className="hover:text-ink"
                >
                  ← Previous
                </Link>
              )}
              {pageNum < totalPages && (
                <Link
                  href={`/admin/clients?q=${encodeURIComponent(search)}&page=${pageNum + 1}`}
                  className="hover:text-ink"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
