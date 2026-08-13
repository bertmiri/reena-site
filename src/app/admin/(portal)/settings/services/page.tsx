import { createClient } from "@/lib/supabase/server";
import { createService, updateService } from "./actions";
import { DeleteServiceButton } from "./delete-service-button";

export const metadata = {
  title: "Services",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  created: "Service added.",
  saved: "Service saved.",
  deleted: "Service deleted.",
};

export default async function ServicesSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;

  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, title, description, sort_order, active")
    .order("sort_order");

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink focus:border-gold";
  const labelClass = "mb-1 block text-xs font-medium text-stone";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-ink">Services</h1>
      <div className="thread-divider mt-3 w-24" />
      <p className="mt-4 text-sm text-stone">
        These appear on the homepage (first three by order) and the Services
        page. Lower order numbers show first.
      </p>

      {ok && MESSAGES[ok] && (
        <p className="mt-6 rounded-md border border-gold/40 bg-champagne/50 px-3.5 py-2.5 text-sm text-ink">{MESSAGES[ok]}</p>
      )}
      {error && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {error === "save" ? "Could not save. Try again." : "Check the fields — title 3+, description 5+ characters."}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {(services ?? []).map((s) => (
          <div key={s.id} className="rounded-lg border border-sand bg-white/50 px-5 py-4">
            <form id={`svc-${s.id}`} action={updateService}>
              <input type="hidden" name="id" value={s.id} />
            </form>
            <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
              <div>
                <label htmlFor={`t-${s.id}`} className={labelClass}>Title</label>
                <input id={`t-${s.id}`} name="title" required defaultValue={s.title} form={`svc-${s.id}`} className={inputClass} />
              </div>
              <div>
                <label htmlFor={`o-${s.id}`} className={labelClass}>Order</label>
                <input id={`o-${s.id}`} name="sort_order" type="number" min={0} max={999} defaultValue={s.sort_order} form={`svc-${s.id}`} className={inputClass} />
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor={`d-${s.id}`} className={labelClass}>Description</label>
              <textarea id={`d-${s.id}`} name="description" required rows={2} defaultValue={s.description ?? ""} form={`svc-${s.id}`} className={inputClass} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="active" defaultChecked={s.active} form={`svc-${s.id}`} className="accent-[#8c7030]" />
                Active (visible on website)
              </label>
              <div className="flex items-center gap-4">
                <DeleteServiceButton id={s.id} title={s.title} />
                <button type="submit" form={`svc-${s.id}`} className="rounded-md bg-ink px-3.5 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-ink-soft">Save</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form action={createService} className="mt-8 rounded-lg border border-gold/40 bg-champagne/30 px-5 py-4">
        <p className="font-display text-lg text-ink">Add a service</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_90px]">
          <div>
            <label htmlFor="new-title" className={labelClass}>Title</label>
            <input id="new-title" name="title" required minLength={3} maxLength={80} className={inputClass} />
          </div>
          <div>
            <label htmlFor="new-order" className={labelClass}>Order</label>
            <input id="new-order" name="sort_order" type="number" min={0} max={999} defaultValue={10} className={inputClass} />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="new-desc" className={labelClass}>Description</label>
          <textarea id="new-desc" name="description" required minLength={5} maxLength={400} rows={2} className={inputClass} />
        </div>
        <p className="mt-3 text-right">
          <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">Add Service</button>
        </p>
      </form>
    </div>
  );
}
