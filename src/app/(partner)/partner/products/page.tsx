import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProductList } from "@/features/products/components/product-list";

export const metadata: Metadata = { title: "Pazaryeri" };

export default function Page() {
  return (<><PageHeader title="Pazaryeri" description="Markaların kampanyalarına göz atın ve link talep edin" /><ProductList mode="marketplace" /></>);
}
