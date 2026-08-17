import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, type ClientStatus } from "@/lib/clients";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const ACTION_LABELS: Record<string, string> = {
  client_created: "New client added",
  client_updated: "Client details updated",
  upload_link_created: "Upload link created",
  upload_link_revoked: "Upload link revoked",
  document_uploaded: "Document uploaded",
  upload_submitted: "Client submitted documents",
  document_downloaded: "Document downloaded",
  document_viewed: "Document viewed",
  document_deleted: "Document deleted",
  zip_downloaded: "Documents downloaded as ZIP",
  multi_zip_exported: "Multiple clients exported",
  listing_created: "New listing added",
  listing_updated: "Listing updated",
  listing_deleted: "Listing deleted",
  password_changed: "Password changed",
  password_changed_via_reset: "Password reset",
  email_change_requested: "Email change requested",
  website_settings_changed: "Website settings updated",
  loan_settings_changed: "Loan calculator settings updated",
  service_created: "Service added",
  service_updated: "Service updated",
  service_deleted: "Service removed",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-MY");
}

function Stat({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: number;
  href: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-sand bg-white/60 px-5 py-4 transition-colors hover:border-gold"
    >
      <p className="text-xs uppercase tracking-wide text-stone">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-stone">{hint}</p>}
    </Link>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    clientsTotal,
    awaitingDocs,
    docsTotal,
    docsWeek,
    listingsLive,
    listingsDraft,
    activity,
    recentClients,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).neq("status", "archived"),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "documents_requested"),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }).gte("uploaded_at", since),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "hidden"),
    supabase.from("audit_logs").select("id, action, created_at, metadata, clients(full_name)").order("created_at", { ascending: false }).limit(8),
    supabase.from("clients").select("id, full_name, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const events = activity.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <div className="thread-divider mt-3 w-24" />
      <p className="mt-4 text-sm text-stone">
        Welcome back, <span className="font-medium text-ink">{user?.email}</span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clients" value={clientsTotal.count ?? 0} href="/admin/clients" hint="active" />
        <Stat label="Awaiting documents" value={awaitingDocs.count ?? 0} href="/admin/clients?q=" hint="requested" />
        <Stat label="Documents" value={docsTotal.count ?? 0} href="/admin/clients" hint={`${docsWeek.count ?? 0} this week`} />
        <Stat label="Listings live" value={listingsLive.count ?? 0} href="/admin/listings" hint={`${listingsDraft.count ?? 0} draft`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/clients/new" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">+ Add Client</Link>
        <Link href="/admin/listings/new" className="rounded-md border border-sand px-4 py-2 text-sm text-ink transition-colors hover:border-gold">+ Add Listing</Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-sand bg-white/50 px-5 py-5">
          <h2 className="font-display text-xl text-ink">Recent activity</h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-stone">Nothing yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {events.map((e) => {
                const c = Array.isArray(e.clients) ? e.clients[0] : e.clients;
                return (
                  <li key={e.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-ink">
                      {ACTION_LABELS[e.action] ?? e.action}
                      {c?.full_name && <span className="text-stone"> · {c.full_name}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-stone">{timeAgo(e.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-sand bg-white/50 px-5 py-5">
          <h2 className="font-display text-xl text-ink">Latest clients</h2>
          {(recentClients.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-stone">No clients yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {(recentClients.data ?? []).map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/clients/${c.id}`} className="flex items-start justify-between gap-3 text-sm">
                    <span className="font-medium text-ink hover:text-gold-deep">{c.full_name}</span>
                    <span className="shrink-0 text-xs text-stone">{STATUS_LABELS[c.status as ClientStatus]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
