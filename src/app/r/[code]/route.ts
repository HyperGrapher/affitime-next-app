import { NextResponse, type NextRequest } from "next/server";
import { loadViewer } from "@/server/session";
import { VISIT_COOKIE, signCookie, trackVisit } from "@/features/visits/tracking";
import { memoryRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { routes } from "@/lib/routes";
import { env } from "@/env";

export const dynamic = "force-dynamic";

/** Public tracking redirect: records the visit, sets the signed cookie, 302s to the product. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const ip = getClientIp(req.headers);
  const unavailable = (reason: string) => NextResponse.redirect(new URL(routes.unavailable(reason), env.NEXT_PUBLIC_APP_URL), 302);

  // Burst shield: per-instance, per-IP. Abusive clients just get bounced without a DB write.
  if (!memoryRateLimit(`r:${ip}`, 30, 60_000)) return new NextResponse("Too many requests", { status: 429, headers: { "Retry-After": "60" } });
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(code)) return unavailable("not-found");

  // Only resolve the session if a session cookie is present (keeps anonymous traffic cheap).
  const hasSessionCookie = req.cookies.getAll().some((c) => c.name.includes("session_token"));
  const viewer = hasSessionCookie ? await loadViewer(req.headers) : null;

  const result = await trackVisit({
    code, headers: req.headers, rawCookie: req.cookies.get(VISIT_COOKIE)?.value, searchParams: req.nextUrl.searchParams,
    viewer: viewer ? { role: viewer.role } : null,
  });

  if (result.type === "unavailable") return unavailable(result.reason);

  const res = NextResponse.redirect(result.url, 302);
  res.cookies.set(VISIT_COOKIE, signCookie(result.cookie), {
    httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production", path: "/", maxAge: result.cookieMaxAgeSec,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
