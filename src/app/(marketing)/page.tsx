import { ArrowRight, BarChart3, BellRing, Coins, Megaphone, PlugZap, ShieldCheck, Store, Users } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Reveal } from "@/components/marketing/reveal";
import { db } from "@/server/db";
import { formatNumber } from "@/lib/money";
import { routes } from "@/lib/routes";
import { TRIAL_DAYS } from "@/domain/pricing";

export const metadata: Metadata = {
  title: "Affitime — Markalar ürün satar, partnerler kazanır",
  description: "Affiliate pazaryeri: takip linkleri, bot koruması, gerçek zamanlı paneller ve otomatik komisyon ödemeleri tek yerde.",
};

// Stats and FAQ come from the database; revalidate hourly so the page stays static-fast.
export const revalidate = 3600;

async function loadData() {
  try {
    const [partners, vendors, products, clicks, faq] = await Promise.all([
      db.partner.count(), db.vendor.count(), db.product.count({ where: { status: "ACTIVE" } }),
      db.visit.count({ where: { billable: true } }), db.faq.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { id: "asc" }] }),
    ]);
    return { partners, vendors, products, clicks, faq };
  } catch {
    return { partners: 0, vendors: 0, products: 0, clicks: 0, faq: [] };
  }
}

const CATEGORIES = ["Elektronik", "Giyim & Aksesuar", "Müzik Aletleri", "Cep Telefonu", "Ev Aletleri", "Anne & Bebek", "Hobi & Oyuncak", "Kozmetik", "Oyun & Konsol", "Takı & Mücevher"];

const VENDOR_STEPS = [["Ürününüzü ekleyin", "Fiyat, komisyon ve çerez süresini birkaç dakikada tanımlayın."], ["Partnerleri onaylayın", "Başvuran yayıncıların profiline bakın, uygun olanları tek tıkla onaylayın."], ["Sonuca göre ödeyin", "Yalnızca geçerli tıklamalar için komisyon doğar; ödemeyi panelden yapın."]];
const PARTNER_STEPS = [["Pazaryerinde keşfedin", "Komisyonu ve çerez süresiyle yüzlerce kampanyayı filtreleyin."], ["Link talep edin", "Onay sonrası size özel takip linkiniz oluşur."], ["Paylaşın ve kazanın", "Tıklamalarınızı canlı izleyin, komisyonlarınızı IBAN'ınıza alın."]];

const FEATURES = [
  { icon: ShieldCheck, title: "Sahte trafiğe karşı koruma", text: "Bot, kendi tıklaması ve tekrar ziyaretler otomatik elenir. Yalnızca tekil, geçerli tıklamalar komisyona dönüşür.", className: "md:col-span-2" },
  { icon: BarChart3, title: "Canlı paneller", text: "Günlük tıklama, kazanç ve ülke dağılımı gerçek zamanlı.", className: "" },
  { icon: Coins, title: "Otomatik komisyon hesabı", text: "Sabit ya da yüzde; her tıklamanın değeri anında hesaplanır, bekleyen bakiye şeffaftır.", className: "" },
  { icon: Megaphone, title: "Pazaryeri kampanyaları", text: "Ürününüzü partner pazaryerinde öne çıkarın; süre dolunca otomatik biter.", className: "" },
  { icon: PlugZap, title: "Mağaza API", text: "Mağaza eklentiniz tek bir anahtarla bağlanır, takibin durumunu anında öğrenir.", className: "" },
  { icon: BellRing, title: "Akıllı bildirimler", text: "Başvuru, onay, ödeme ve plan hatırlatmaları uygulama içinde ve e-postayla.", className: "md:col-span-2" },
];

export default async function Home() {
  const stats = await loadData();
  const items = stats.faq.map((f) => ({ id: f.id, question: f.question, answer: f.answer }));
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted"><span className="size-2 rounded-full bg-success" /> Affiliate pazaryeri · {formatNumber(stats.partners)} partner, {formatNumber(stats.vendors)} marka</p>
            <h1 className="mt-6 font-display text-display font-extrabold">Markalar satar.<br /><span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Partnerler kazanır.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">Affitime, markaları içerik üreticileriyle buluşturur. Takip, bot koruması, raporlama ve komisyon ödemeleri — hepsi tek platformda, kurulumsuz.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={routes.signup("vendor")} size="lg">Marka olarak başla <ArrowRight /></ButtonLink>
              <ButtonLink href={routes.signup("partner")} variant="outline" size="lg">Partner olarak katıl</ButtonLink>
            </div>
            <p className="mt-5 text-sm text-muted">{TRIAL_DAYS} gün ücretsiz deneme · Kredi kartı gerekmez · Partnerler için ücretsiz</p>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* CATEGORY MARQUEE */}
      <div aria-hidden className="overflow-hidden border-y border-border bg-surface py-5 [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-semibold text-muted">
          {[...CATEGORIES, ...CATEGORIES].map((c, i) => <span key={i} className="flex items-center gap-10">{c}<span className="size-1.5 rounded-full bg-accent" /></span>)}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal><h2 className="max-w-2xl font-display text-h1 font-extrabold">İki taraf için de üç adım.</h2><p className="mt-3 max-w-xl text-muted">Ürünü olan da, kitlesi olan da dakikalar içinde kazanç döngüsüne girer.</p></Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {[{ title: "Markalar için", icon: Store, steps: VENDOR_STEPS, tone: "bg-primary text-primary-foreground" }, { title: "Partnerler için", icon: Users, steps: PARTNER_STEPS, tone: "bg-accent text-white" }].map((col, ci) => (
            <Reveal key={col.title} delay={ci * 0.1}>
              <div className="h-full rounded-3xl border border-border bg-surface p-8 shadow-card">
                <div className="flex items-center gap-3"><span className={`grid size-11 place-items-center rounded-2xl ${col.tone}`}><col.icon className="size-5" /></span><h3 className="text-xl font-bold">{col.title}</h3></div>
                <ol className="mt-8 grid gap-6">
                  {col.steps.map(([title, text], i) => (
                    <li key={title} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold">{i + 1}</span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted">{text}</p></div></li>
                  ))}
                </ol>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-20 bg-surface-2/60 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal><h2 className="max-w-2xl font-display text-h1 font-extrabold">Güvenle büyümek için gereken her şey.</h2></Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.06} className={f.className}>
                <div className="group h-full rounded-3xl border border-border bg-surface p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><f.icon className="size-5" /></span>
                  <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <dl className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[[formatNumber(stats.vendors), "Marka"], [formatNumber(stats.partners), "Partner"], [formatNumber(stats.products), "Aktif kampanya"], [formatNumber(stats.clicks), "Geçerli tıklama"]].map(([n, l]) => (
            <div key={l} className="bg-surface p-8 text-center"><dt className="text-sm text-muted">{l}</dt><dd className="mt-1 font-display text-4xl font-extrabold tracking-tight tabular-nums">{n}</dd></div>
          ))}
        </dl>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6">
        <Reveal><div className="mb-12 text-center"><h2 className="font-display text-h1 font-extrabold">Basit, şeffaf fiyatlandırma</h2><p className="mt-3 text-muted">Komisyon kesintisi yok. Sabit aylık plan, sınırsız partner trafiği.</p></div></Reveal>
        <PricingSection />
      </section>

      {/* FAQ */}
      {items.length ? (
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-24 sm:px-6">
          <Reveal><h2 className="mb-8 text-center font-display text-h1 font-extrabold">Sık sorulan sorular</h2></Reveal>
          <Accordion items={items} />
        </section>
      ) : null}

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-8 py-16 text-center text-primary-foreground">
          <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-accent/40 blur-3xl" />
          <h2 className="relative font-display text-h1 font-extrabold">İlk kampanyanızı bugün yayına alın.</h2>
          <p className="relative mx-auto mt-3 max-w-lg opacity-80">Kurulum yok, taahhüt yok. Dakikalar içinde hesabınızı açın.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={routes.signup("vendor")} variant="accent" size="lg">Marka olarak başla</ButtonLink>
            <ButtonLink href={routes.signup("partner")} size="lg" className="bg-white/15 text-white hover:bg-white/25">Partner ol</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
