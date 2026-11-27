import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { routes } from "@/lib/routes";

const COLS = [
  { title: "Ürün", links: [["Nasıl çalışır", "/#how"], ["Özellikler", "/#features"], ["Fiyatlar", routes.pricing], ["SSS", "/#faq"]] },
  { title: "Şirket", links: [["Blog", routes.blog], ["İletişim", routes.contact], ["Giriş yap", routes.signin], ["Kayıt ol", routes.signup()]] },
  { title: "Yasal", links: [["Kullanıcı Sözleşmesi", routes.legal("terms")], ["Gizlilik Politikası", routes.legal("privacy")], ["Çerez Politikası", routes.legal("cookies")]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div><Logo /><p className="mt-4 max-w-xs text-sm text-muted">Markaları satış ortaklarıyla buluşturan affiliate pazaryeri. Takip, raporlama ve komisyon ödemeleri tek yerde.</p></div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-bold">{c.title}</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted">{c.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-foreground">{label}</Link></li>)}</ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">© {new Date().getFullYear()} Affitime. Tüm hakları saklıdır.</div>
    </footer>
  );
}
