import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PaymentsAdmin } from "@/features/admin/components/admin-views";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "Ödemeler" };

export default async function Page() {
  await requireRole(["ADMIN"]);
  return (<><PageHeader title="Ödemeler" description="Plan, kampanya ve komisyon ödemeleri (simüle)" /><PaymentsAdmin /></>);
}
