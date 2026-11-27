import { NextResponse, type NextRequest } from "next/server";

// Coarse guard only: is there a session cookie at all? Real authentication/authorisation (role, ownership, plan)
// is enforced server-side in layouts and in every tRPC procedure.
const PROTECTED = ["/vendor", "/partner", "/admin", "/billing"];
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hasSession = SESSION_COOKIES.some((c) => req.cookies.has(c));

  if (needsAuth && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  // Let server components know the path (used by the vendor paywall gate).
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|webmanifest)$).*)"] };
