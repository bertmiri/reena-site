import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CLIENT_STATUSES, STATUS_LABELS } from "@/lib/clients";
import { updateClientRecord } from "../actions";
import { UploadRequestsSection } from "./upload-requests-section";
import { DocumentsSection } from "./documents-section";

export const metadata = {
  title: "Client Details",
  robots: { index: false, follow: false },
};

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select(
      "id, full_name, email, phone, application_reference, status, notes, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink placeholder:text-stone/60 focus:border-gold";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/clients" className="text-sm text-stone hover:text-ink">
        ← All clients
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">{client.full_name}</h1>
          <div className="thread-divider mt-3 w-24" />
        </div>
        <p className="font-mono text-xs text-stone">{client.application_reference}</p>
      </div>

      <p className="mt-4 text-xs text-stone">
        Created {new Date(client.created_at).toLocaleDateString("en-MY")} · Last
        updated {new Date(client.updated_at).toLocaleDateString("en-MY")}
      </p>

      {saved && (
        <p className="mt-6 rounded-md border border-gold/40 bg-champagne/50 px-3.5 py-2.5 text-sm text-ink">
          Changes saved.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {error}
        </p>
      )}

      <form action={updateClientRecord} className="mt-8 space-y-5">
        <input type="hidden" name="id" value={client.id} />

        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name *
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            minLength={2}
            maxLength={120}
            defaultValue={client.full_name}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={160}
            defaultValue={client.email ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={client.phone ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select id="status" name="status" defaultValue={client.status} className={inputClass}>
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>
            Private notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            maxLength={5000}
            defaultValue={client.notes ?? ""}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-stone">Never visible to clients.</p>
        </div>

        <button
          type="submit"
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          Save Changes
        </button>
      </form>

      <UploadRequestsSection clientId={client.id} clientName={client.full_name} />

      <DocumentsSection clientId={client.id} />
    </div>
  );
}
