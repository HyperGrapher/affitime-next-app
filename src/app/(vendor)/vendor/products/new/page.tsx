import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "@/features/products/components/product-form";

export const metadata: Metadata = { title: "Yeni ürün" };

export default function Page() {
  return (<><PageHeader title="Yeni ürün" description="Ürünü ve partner komisyonlarını tanımlayın" /><ProductForm /></>);
}
