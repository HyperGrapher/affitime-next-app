import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { IbanForm, OnboardingForm, PartnerProfileForm, SecurityForms } from "@/features/account/components/settings-forms";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function Page() {
  const viewer = await requireRole(["PARTNER"]);
  await prefetch(trpc.account.partnerSettings.queryOptions());
  return (
    <HydrateClient>
      <PageHeader title="Ayarlar" />
      <div className="grid gap-6"><PartnerProfileForm /><IbanForm /><OnboardingForm mode="settings" /><SecurityForms email={viewer.email} /></div>
    </HydrateClient>
  );
}
