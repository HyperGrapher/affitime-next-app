import { describe, expect, it } from "vitest";
import { classifyVisit, cookieStillValid, type VisitSignals } from "../visit";

const base: VisitSignals = { userAgent: "Mozilla/5.0 Chrome", isBot: false, viewerRole: null, linkPartnerId: "p1", linkVendorId: "v1", knownIp: null, hasCookie: false };
const now = new Date("2026-06-15T12:00:00Z");
const day = 86_400_000;

describe("visit uniqueness & fraud rules", () => {
  it("counts a first anonymous human visit as unique and billable", () => {
    expect(classifyVisit(base)).toEqual({ flag: null, isUnique: true, billable: true });
  });

  it("flags bots and missing user agents", () => {
    expect(classifyVisit({ ...base, isBot: true })).toMatchObject({ flag: "BOT", billable: false });
    expect(classifyVisit({ ...base, userAgent: null })).toMatchObject({ flag: "NO_USER_AGENT", billable: false });
  });

  it("flags self clicks by signed-in partners, vendors and staff", () => {
    expect(classifyVisit({ ...base, viewerRole: "PARTNER" })).toMatchObject({ flag: "SELF_PARTNER", billable: false });
    expect(classifyVisit({ ...base, viewerRole: "VENDOR" })).toMatchObject({ flag: "SELF_VENDOR", billable: false });
    expect(classifyVisit({ ...base, viewerRole: "ADMIN" })).toMatchObject({ flag: "STAFF", billable: false });
  });

  it("flags clicks from an IP previously seen at a partner/vendor sign-in", () => {
    expect(classifyVisit({ ...base, knownIp: "PARTNER" })).toMatchObject({ flag: "SELF_PARTNER", billable: false });
    expect(classifyVisit({ ...base, knownIp: "VENDOR" })).toMatchObject({ flag: "SELF_VENDOR", billable: false });
  });

  it("treats a repeat visit inside cookie life as non-unique, not fraudulent and not billable", () => {
    expect(classifyVisit({ ...base, hasCookie: true })).toEqual({ flag: null, isUnique: false, billable: false });
  });

  it("gives bots priority over the repeat-visit rule", () => {
    expect(classifyVisit({ ...base, isBot: true, hasCookie: true }).flag).toBe("BOT");
  });
});

describe("visit cookie window", () => {
  const cookie = { v: { abc123: new Date(+now - 10 * day).toISOString() } };

  it("is valid inside the link's cookie life", () => {
    expect(cookieStillValid(cookie, "abc123", 30, now)).toBe(true);
  });

  it("expires after the cookie life", () => {
    expect(cookieStillValid(cookie, "abc123", 7, now)).toBe(false);
  });

  it("is per link code and tolerates missing cookies", () => {
    expect(cookieStillValid(cookie, "other", 30, now)).toBe(false);
    expect(cookieStillValid(null, "abc123", 30, now)).toBe(false);
  });
});
