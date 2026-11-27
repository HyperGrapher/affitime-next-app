"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownContent, DropdownItem, DropdownMenu, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { routes, type AppRole } from "@/lib/routes";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";
import { t } from "@/i18n";
import { NAV, type NavItem } from "./nav-config";

export interface ShellUser { name: string; email: string; image: string | null; role: AppRole; subtitle?: string }

function NavList({ items, onNavigate, unread }: { items: NavItem[]; onNavigate?: () => void; unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Ana menü" className="grid gap-1">
      {items.map((item) => {
        const active = pathname === item.href || (item.href.length > 8 && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-foreground")}
          >
            <item.icon className="size-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.badge === "notifications" && unread > 0 ? <Badge tone="accent" className="px-2">{unread}</Badge> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ user, banner, children }: { user: ShellUser; banner?: ReactNode; children: ReactNode }) {
  const trpc = useTRPC();
  const router = useRouter();
  const { navOpen, setNavOpen } = useUiStore();
  const unreadQuery = useQuery({ ...trpc.notifications.unreadCount.queryOptions(), refetchInterval: 60_000 });
  const unread = unreadQuery.data ?? 0;
  const items = NAV[user.role === "MODERATOR" ? "ADMIN" : (user.role as "VENDOR" | "PARTNER" | "ADMIN")];
  const notificationsHref = user.role === "VENDOR" ? routes.vendor.notifications : user.role === "PARTNER" ? routes.partner.notifications : null;
  const settingsHref = user.role === "VENDOR" ? routes.vendor.settings : user.role === "PARTNER" ? routes.partner.settings : null;

  async function signOut() {
    await authClient.signOut();
    router.push(routes.signin);
    router.refresh();
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-border bg-surface px-4 py-5 lg:flex">
        <Logo href={routes.home} className="px-2" />
        <div className="-mx-1 flex-1 overflow-y-auto px-1"><NavList items={items} unread={unread} /></div>
        <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
          <Avatar name={user.name} src={user.image} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.subtitle ?? t.roles[user.role]}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t.nav.openMenu} onClick={() => setNavOpen(true)}><Menu /></Button>
          <Logo href={routes.home} className="lg:hidden" />
          <div className="ml-auto flex items-center gap-1">
            {notificationsHref ? (
              <Link href={notificationsHref} aria-label={t.nav.notifications} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
                <Bell />
                {unread > 0 ? <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-background" /> : null}
              </Link>
            ) : null}
            <ThemeToggle />
            <DropdownMenu>
              <DropdownTrigger aria-label="Hesap menüsü" className="ml-1 rounded-full"><Avatar name={user.name} src={user.image} /></DropdownTrigger>
              <DropdownContent>
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                <DropdownSeparator />
                {settingsHref ? <DropdownItem render={<Link href={settingsHref} />}><Settings /> {t.nav.settings}</DropdownItem> : null}
                <DropdownItem onClick={signOut}><LogOut /> {t.nav.signOut}</DropdownItem>
              </DropdownContent>
            </DropdownMenu>
          </div>
        </header>
        {banner}
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      <Dialog open={navOpen} onOpenChange={setNavOpen}>
        <DialogContent title={t.nav.openMenu} side="left">
          <div className="flex h-full flex-col gap-6 p-5">
            <Logo href={routes.home} />
            <div className="flex-1 overflow-y-auto"><NavList items={items} unread={unread} onNavigate={() => setNavOpen(false)} /></div>
            <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
              <Avatar name={user.name} src={user.image} />
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
