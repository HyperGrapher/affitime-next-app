import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LinksView } from "@/features/links/components/links-view";

export const metadata: Metadata = { title: "Linkler" };

export default function Page() {
  return (<><PageHeader title="Tüm linkler" /><LinksView role="ADMIN" /></>);
}
