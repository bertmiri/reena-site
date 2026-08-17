import { getSiteSettings } from "@/lib/site-settings";
import { SiteHeader } from "@/components/public/site-header";
import { listingsVisible } from "@/lib/listings-public";
import { SiteFooter } from "@/components/public/site-footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const { visible: showListings } = await listingsVisible();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader settings={settings} showListings={showListings} />
      <div className="flex-1">{children}</div>
      <SiteFooter settings={settings} />
    </div>
  );
}
