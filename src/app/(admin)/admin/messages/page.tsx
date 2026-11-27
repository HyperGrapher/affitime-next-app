import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MessagesAdmin } from "@/features/admin/components/admin-views";

export const metadata: Metadata = { title: "Mesajlar" };

export default function Page() {
  return (<><PageHeader title="İletişim mesajları" /><MessagesAdmin /></>);
}
