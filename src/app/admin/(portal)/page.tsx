import { createClient } from "@/lib/supabase/server";

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
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <div className="thread-divider mt-4 w-24" />
      <p className="mt-6 text-stone">
        Welcome back,{" "}
        <span className="font-medium text-ink">{user?.email}</span>
      </p>
      <p className="mt-2 text-sm text-stone">
        Placeholder — live stats arrive with client management.
      </p>
    </div>
  );
}
