import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationsView } from "@/features/notifications/components/notifications-view";

export const metadata: Metadata = { title: "Bildirimler" };

export default function Page() {
  return (<><PageHeader title="Bildirimler" /><NotificationsView /></>);
}
