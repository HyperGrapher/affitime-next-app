import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { OutboxList } from "@/features/admin/components/admin-views";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "Outbox" };

export default async function Page() {
  await requireRole(["ADMIN"]);
  return (<><PageHeader title="Outbox" description="Demo ortamında gönderilen tüm e-postalar (doğrulama, şifre sıfırlama, bildirimler…)" /><OutboxList /></>);
}
