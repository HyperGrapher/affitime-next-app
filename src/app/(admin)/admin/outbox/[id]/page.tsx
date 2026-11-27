import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { OutboxItem } from "@/features/admin/components/admin-views";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "E-posta" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  return (<><PageHeader title="E-posta" /><OutboxItem id={id} /></>);
}
