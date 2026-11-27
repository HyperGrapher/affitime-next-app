import type { VisitFlag } from "@/generated/prisma/client";

export interface VisitSignals {
  userAgent: string | null;
  isBot: boolean;
  /** Role of the signed-in user making the click, if any. */
  viewerRole: "VENDOR" | "PARTNER" | "ADMIN" | "MODERATOR" | null;
  viewerPartnerId?: string | null;
  viewerVendorId?: string | null;
  linkPartnerId: string;
  linkVendorId: string;
  /** IP matches an IP seen at sign-in of the link's partner / vendor / staff */
  knownIp: "PARTNER" | "VENDOR" | "STAFF" | null;
  /** Valid signed visit cookie for this link present (inside the cookie-life window) */
  hasCookie: boolean;
}

export interface VisitVerdict {
  flag: VisitFlag | null;
  isUnique: boolean;
  billable: boolean;
}

/**
 * Classifies a click. Rules, in priority order:
 *  1. bots / missing UA → flagged, not billable
 *  2. signed-in partner/vendor/staff clicking → flagged (self-click)
 *  3. IP previously seen for a partner/vendor/staff account → flagged
 *  4. valid cookie inside cookie-life → repeat visit: not unique, not flagged, not billable
 *  5. otherwise unique + billable
 */
export function classifyVisit(s: VisitSignals): VisitVerdict {
  if (!s.userAgent) return { flag: "NO_USER_AGENT", isUnique: false, billable: false };
  if (s.isBot) return { flag: "BOT", isUnique: false, billable: false };

  if (s.viewerRole === "ADMIN" || s.viewerRole === "MODERATOR") return { flag: "STAFF", isUnique: false, billable: false };
  if (s.viewerRole === "PARTNER") return { flag: "SELF_PARTNER", isUnique: false, billable: false };
  if (s.viewerRole === "VENDOR") return { flag: "SELF_VENDOR", isUnique: false, billable: false };

  if (s.knownIp === "STAFF") return { flag: "STAFF", isUnique: false, billable: false };
  if (s.knownIp === "PARTNER") return { flag: "SELF_PARTNER", isUnique: false, billable: false };
  if (s.knownIp === "VENDOR") return { flag: "SELF_VENDOR", isUnique: false, billable: false };

  if (s.hasCookie) return { flag: null, isUnique: false, billable: false };
  return { flag: null, isUnique: true, billable: true };
}

export interface VisitCookie {
  /** link code → ISO date of last visit */
  v: Record<string, string>;
}

/** Cookie holds the last visit date per link code; it counts only while inside the link's cookie-life. */
export function cookieStillValid(cookie: VisitCookie | null, code: string, cookieDays: number, now = new Date()): boolean {
  const last = cookie?.v?.[code];
  if (!last) return false;
  const ageMs = now.getTime() - new Date(last).getTime();
  return ageMs >= 0 && ageMs < cookieDays * 86_400_000;
}
