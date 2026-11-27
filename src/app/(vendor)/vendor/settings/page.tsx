import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SecurityForms, VendorProfileForm } from "@/features/account/components/settings-forms";
import { TaxInfoForm } from "@/features/payments/components/tax-info-form";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { requireRole } from "@/server/guards";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function Page() {
  const viewer = await requireRole(["VENDOR"]);
  await prefetch(trpc.account.vendorSettings.queryOptions(), trpc.payments.taxInfo.queryOptions());
  return (
    <HydrateClient>
      <PageHeader title="Ayarlar" />
      <div className="grid gap-6"><VendorProfileForm /><TaxInfoForm /><SecurityForms email={viewer.email} /></div>
    </HydrateClient>
  );
}
