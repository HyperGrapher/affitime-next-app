import { Bell, Boxes, CreditCard, FileText, LayoutDashboard, Link2, Mail, MessageSquare, Package, Settings, ShoppingBag, Users, KeyRound, HelpCircle, Wallet, type LucideIcon } from "lucide-react";
import { routes, type AppRole } from "@/lib/routes";
import { t } from "@/i18n";

export interface NavItem { href: string; label: string; icon: LucideIcon; badge?: "notifications" }

export const NAV: Record<"VENDOR" | "PARTNER" | "ADMIN", NavItem[]> = {
  VENDOR: [
    { href: routes.vendor.dashboard, label: t.nav.dashboard, icon: LayoutDashboard },
    { href: routes.vendor.products, label: t.nav.products, icon: Package },
    { href: routes.vendor.links, label: t.nav.links, icon: Link2 },
    { href: routes.vendor.payments, label: t.nav.payments, icon: Wallet },
    { href: routes.vendor.notifications, label: t.nav.notifications, icon: Bell, badge: "notifications" },
    { href: routes.vendor.storeApi, label: t.nav.storeApi, icon: KeyRound },
    { href: routes.billing.plans, label: t.nav.billing, icon: CreditCard },
    { href: routes.vendor.settings, label: t.nav.settings, icon: Settings },
  ],
  PARTNER: [
    { href: routes.partner.dashboard, label: t.nav.dashboard, icon: LayoutDashboard },
    { href: routes.partner.products, label: t.nav.marketplace, icon: ShoppingBag },
    { href: routes.partner.links, label: t.nav.links, icon: Link2 },
    { href: routes.partner.payments, label: t.nav.payments, icon: Wallet },
    { href: routes.partner.notifications, label: t.nav.notifications, icon: Bell, badge: "notifications" },
    { href: routes.partner.settings, label: t.nav.settings, icon: Settings },
  ],
  ADMIN: [
    { href: routes.admin.dashboard, label: t.nav.dashboard, icon: LayoutDashboard },
    { href: routes.admin.users, label: t.nav.users, icon: Users },
    { href: routes.admin.products, label: t.nav.products, icon: Boxes },
    { href: routes.admin.links, label: t.nav.links, icon: Link2 },
    { href: routes.admin.payments, label: t.nav.payments, icon: CreditCard },
    { href: routes.admin.outbox, label: t.nav.outbox, icon: Mail },
    { href: routes.admin.messages, label: t.nav.messages, icon: MessageSquare },
    { href: routes.admin.faq, label: t.nav.faq, icon: HelpCircle },
  ],
};

export const navFor = (role: AppRole) => NAV[role === "MODERATOR" ? "ADMIN" : role];
export { FileText };
