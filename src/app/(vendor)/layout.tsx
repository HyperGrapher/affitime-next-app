import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PlanBanner } from "@/components/layout/plan-banner";
import { enforceVendorPaywall, requireRole } from "@/server/guards";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const viewer = await requireRole(["VENDOR"]);
  await enforceVendorPaywall(viewer);
  return (
    <AppShell user={{ name: viewer.vendor?.brand ?? viewer.name, email: viewer.email, image: viewer.vendor?.logo ?? viewer.image, role: "VENDOR", subtitle: "Marka" }} banner={viewer.vendor ? <PlanBanner plan={viewer.vendor.plan} /> : null}>
      {children}
    </AppShell>
  );
}
