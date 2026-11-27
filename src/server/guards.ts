import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getViewer, type Viewer } from "@/server/session";
import { homeForRole, routes, type AppRole } from "@/lib/routes";
import { isPlanActive } from "@/domain/plan";

/** Server-side gate for role layouts. Redirects (never renders) when the viewer is not allowed. */
export async function requireRole(roles: AppRole[]): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(routes.signin);
  if (!viewer.emailVerified) redirect(routes.notVerified);
  if (!roles.includes(viewer.role)) redirect(homeForRole(viewer.role));
  return viewer;
}

const PAYWALL_ALLOWED = ["/billing", "/vendor/settings", "/vendor/payments", "/vendor/notifications", "/vendor/dashboard"];

/** Vendor whose plan ended can only see billing + a few read-only pages. */
export async function enforceVendorPaywall(viewer: Viewer) {
  if (!viewer.vendor || isPlanActive(viewer.vendor.plan)) return;
  const path = (await headers()).get("x-pathname") ?? "";
  if (!PAYWALL_ALLOWED.some((p) => path === p || path.startsWith(`${p}/`))) redirect(routes.billing.paymentRequired);
}
