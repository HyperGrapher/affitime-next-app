import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PlansView } from "@/features/payments/components/plans-view";
import { requireRole } from "@/server/guards";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Planlar" };

export default async function Page() {
  const viewer = await requireRole(["VENDOR"]);
  await prefetch(trpc.payments.taxInfo.queryOptions());
  const plan = viewer.vendor?.plan;
  return (
    <HydrateClient>
      <PageHeader title="Planınızı seçin" description="Tüm planlarda partner takibi, panel ve bildirimler dahildir." />
      <PlansView currentPlan={plan?.state === "PLAN" || plan?.state === "PLAN_ENDED" ? plan.plan : null} />
    </HydrateClient>
  );
}
