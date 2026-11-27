import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { FaqAdmin } from "@/features/admin/components/admin-views";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "SSS" };

export default async function Page() {
  await requireRole(["ADMIN"]);
  return (<><PageHeader title="Sık sorulan sorular" /><FaqAdmin /></>);
}
