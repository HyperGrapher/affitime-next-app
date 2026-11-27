import { Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeaderActions } from "./header-actions";
import { routes } from "@/lib/routes";
import { t } from "@/i18n";

const LINKS = [{ href: "/#how", label: t.nav.howItWorks }, { href: "/#features", label: t.nav.features }, { href: routes.pricing, label: t.nav.pricing }, { href: routes.blog, label: t.nav.blog }, { href: routes.contact, label: t.nav.contact }];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Site menüsü" className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-foreground">{l.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <HeaderActions />
          <details className="relative md:hidden">
            <summary aria-label={t.nav.openMenu} className="grid size-10 cursor-pointer list-none place-items-center rounded-lg hover:bg-surface-2 [&::-webkit-details-marker]:hidden"><Menu className="size-5" /></summary>
            <nav aria-label="Mobil menü" className="absolute right-0 top-12 grid w-56 gap-1 rounded-xl border border-border bg-surface p-2 shadow-xl">
              {LINKS.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-2">{l.label}</Link>)}
              <Link href={routes.signin} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-2">{t.nav.signIn}</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
