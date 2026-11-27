import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/server/guards";

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const viewer = await requireRole(["PARTNER"]);
  return (
    <AppShell user={{ name: viewer.partner?.username ?? viewer.name, email: viewer.email, image: viewer.partner?.avatar ?? viewer.image, role: "PARTNER", subtitle: "Partner" }}>
      {children}
    </AppShell>
  );
}
