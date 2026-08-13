import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/login/actions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const navLink =
    "rounded-md px-3 py-2 text-ink transition-colors hover:bg-champagne/60";

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 flex-col border-r border-sand bg-white/60 px-4 py-6 md:flex">
        <div className="px-3">
          <p className="font-display text-xl text-ink">RM Property Hub</p>
          <p className="mt-0.5 text-xs tracking-wide text-stone">Agent Portal</p>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1 text-sm">
          <Link href="/admin" className={navLink}>
            Dashboard
          </Link>
          <Link href="/admin/clients" className={navLink}>
            Clients
          </Link>
          <Link href="/admin/settings/account" className={navLink}>Settings</Link>
        </nav>
        <div className="border-t border-sand pt-4">
          <p className="truncate px-3 text-xs text-stone">{user.email}</p>
          <form action={signOut} className="mt-2 px-3">
            <button
              type="submit"
              className="text-sm text-stone transition-colors hover:text-hibiscus-deep"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-sand px-4 py-3 md:hidden">
          <p className="font-display text-lg text-ink">RM Property Hub</p>
          <nav className="flex gap-4 text-sm text-ink">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/clients">Clients</Link>
            <Link href="/admin/settings/account">Settings</Link>
          </nav>
        </header>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
