import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/pricing-section";

export const metadata: Metadata = { title: "Fiyatlar", description: "Basic, Pro ve Ultimate planlar. 14 gün ücretsiz deneyin." };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 text-center"><h1 className="font-display text-h1 font-extrabold">Fiyatlandırma</h1><p className="mt-3 text-muted">İhtiyacınıza uygun planı seçin; istediğiniz zaman değiştirin.</p></div>
      <PricingSection />
    </div>
  );
}
