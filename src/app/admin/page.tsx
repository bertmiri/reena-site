import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <div className="thread-divider mt-4 w-24" />
      <p className="mt-6 text-stone">
        Signed in as <span className="font-medium text-ink">{user?.email}</span>
      </p>
      <p className="mt-2 text-sm text-stone">
        Placeholder — the real dashboard arrives with client management.
      </p>
      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="rounded-md border border-sand px-4 py-2 text-sm text-ink transition-colors hover:border-hibiscus hover:text-hibiscus-deep"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
