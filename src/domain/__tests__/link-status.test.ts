import { describe, expect, it } from "vitest";
import type { LinkStatus } from "@/generated/prisma/client";
import { availableActions, transitionLink } from "../link-status";

describe("link status machine", () => {
  it("lets a vendor approve or deny an awaiting request", () => {
    expect(transitionLink("AWAITING", "APPROVE", "VENDOR")).toEqual({ ok: true, to: "CONFIRMED" });
    expect(transitionLink("AWAITING", "DENY", "VENDOR")).toEqual({ ok: true, to: "REQUEST_DENIED" });
  });

  it("never lets a partner approve their own link", () => {
    expect(transitionLink("AWAITING", "APPROVE", "PARTNER")).toEqual({ ok: false, reason: "FORBIDDEN" });
  });

  it("rejects approving something that is not awaiting", () => {
    expect(transitionLink("CONFIRMED", "APPROVE", "VENDOR")).toEqual({ ok: false, reason: "ILLEGAL_TRANSITION" });
    expect(transitionLink("REQUEST_DENIED", "APPROVE", "VENDOR")).toEqual({ ok: false, reason: "ILLEGAL_TRANSITION" });
  });

  it("pauses and resumes confirmed links only", () => {
    expect(transitionLink("CONFIRMED", "PAUSE", "VENDOR")).toEqual({ ok: true, to: "PAUSED_BY_VENDOR" });
    expect(transitionLink("PAUSED_BY_VENDOR", "RESUME", "VENDOR")).toEqual({ ok: true, to: "CONFIRMED" });
    expect(transitionLink("AWAITING", "PAUSE", "VENDOR").ok).toBe(false);
  });

  it("maps CANCEL to the cancelling actor", () => {
    expect(transitionLink("CONFIRMED", "CANCEL", "VENDOR")).toEqual({ ok: true, to: "CANCELED_BY_VENDOR" });
    expect(transitionLink("CONFIRMED", "CANCEL", "PARTNER")).toEqual({ ok: true, to: "CANCELED_BY_PARTNER" });
    expect(transitionLink("CONFIRMED", "CANCEL", "ADMIN")).toEqual({ ok: true, to: "CANCELED_BY_ADMIN" });
  });

  it("treats terminal states as final", () => {
    const terminal: LinkStatus[] = ["REQUEST_DENIED", "CANCELED_BY_VENDOR", "CANCELED_BY_PARTNER", "CANCELED_BY_ADMIN", "PRODUCT_ARCHIVED"];
    for (const s of terminal) {
      for (const a of ["APPROVE", "PAUSE", "RESUME", "CANCEL"] as const) expect(transitionLink(s, a, "VENDOR").ok).toBe(false);
    }
  });

  it("suspends and restores around plan expiry, system only", () => {
    expect(transitionLink("CONFIRMED", "SUSPEND_PLAN", "SYSTEM")).toEqual({ ok: true, to: "PRODUCT_NOT_ACTIVE" });
    expect(transitionLink("PRODUCT_NOT_ACTIVE", "RESTORE_PLAN", "SYSTEM")).toEqual({ ok: true, to: "CONFIRMED" });
    expect(transitionLink("CONFIRMED", "SUSPEND_PLAN", "VENDOR")).toEqual({ ok: false, reason: "FORBIDDEN" });
  });

  it("archiving a product closes every live link state", () => {
    for (const s of ["AWAITING", "CONFIRMED", "PAUSED_BY_VENDOR", "PRODUCT_NOT_ACTIVE"] as const) {
      expect(transitionLink(s, "ARCHIVE_PRODUCT", "VENDOR")).toEqual({ ok: true, to: "PRODUCT_ARCHIVED" });
    }
  });

  it("offers UI actions per actor", () => {
    expect(availableActions("AWAITING", "VENDOR").sort()).toEqual(["APPROVE", "CANCEL", "DENY"]);
    expect(availableActions("CONFIRMED", "PARTNER")).toEqual(["CANCEL"]);
    expect(availableActions("REQUEST_DENIED", "VENDOR")).toEqual([]);
  });
});
