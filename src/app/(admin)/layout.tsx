import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/server/guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const viewer = await requireRole(["ADMIN", "MODERATOR"]);
  return <AppShell user={{ name: viewer.name, email: viewer.email, image: viewer.image, role: viewer.role }}>{children}</AppShell>;
}
