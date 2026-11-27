import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { UsersAdmin } from "@/features/admin/components/admin-views";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "Kullanıcılar" };

export default async function Page() {
  const viewer = await requireRole(["ADMIN", "MODERATOR"]);
  return (<><PageHeader title="Kullanıcılar" /><UsersAdmin canEdit={viewer.role === "ADMIN"} /></>);
}
