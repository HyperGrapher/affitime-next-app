import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ProductList } from "@/features/products/components/product-list";
import { routes } from "@/lib/routes";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Ürünlerim" };

export default function Page() {
  return (
    <>
      <PageHeader title="Ürünlerim" description="Partnerlere sunduğunuz ürünler ve komisyonları" actions={<ButtonLink href={routes.vendor.newProduct}><Plus /> Yeni ürün</ButtonLink>} />
      <ProductList mode="vendor" />
    </>
  );
}
