import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LinksView } from "@/features/links/components/links-view";

export const metadata: Metadata = { title: "Linklerim" };

export default async function Page({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  const g = group === "pending" || group === "live" || group === "closed" ? group : undefined;
  return (<><PageHeader title="Linklerim" description="Başvurularınız ve takip linkleriniz" /><LinksView role="PARTNER" initialGroup={g} /></>);
}
