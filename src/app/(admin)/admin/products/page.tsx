import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProductsAdmin } from "@/features/admin/components/admin-views";

export const metadata: Metadata = { title: "Ürünler" };

export default function Page() {
  return (<><PageHeader title="Ürünler" description="Moderasyon: uygunsuz ürünleri arşivleyin" /><ProductsAdmin /></>);
}
