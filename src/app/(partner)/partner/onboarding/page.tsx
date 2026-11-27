import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { OnboardingForm } from "@/features/account/components/settings-forms";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Hoş geldiniz" };

export default async function Page() {
  await prefetch(trpc.account.partnerSettings.queryOptions());
  return (<HydrateClient><PageHeader title="Sizi tanıyalım" description="Birkaç tercihle size uygun kampanyaları öne çıkaralım. İstediğiniz zaman Ayarlar'dan değiştirebilirsiniz." /><OnboardingForm mode="wizard" /></HydrateClient>);
}
