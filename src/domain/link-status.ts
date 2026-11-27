import type { LinkStatus } from "@/generated/prisma/client";

export type LinkActor = "VENDOR" | "PARTNER" | "ADMIN" | "SYSTEM";

export type LinkAction = "APPROVE" | "DENY" | "PAUSE" | "RESUME" | "CANCEL" | "ARCHIVE_PRODUCT" | "SUSPEND_PLAN" | "RESTORE_PLAN";

interface Rule {
  from: LinkStatus[];
  to: LinkStatus | ((actor: LinkActor) => LinkStatus);
  actors: LinkActor[];
}

const cancelTo = (actor: LinkActor): LinkStatus =>
  actor === "VENDOR" ? "CANCELED_BY_VENDOR" : actor === "PARTNER" ? "CANCELED_BY_PARTNER" : "CANCELED_BY_ADMIN";

/** The link state machine. Anything not listed is illegal. */
export const LINK_RULES: Record<LinkAction, Rule> = {
  APPROVE: { from: ["AWAITING"], to: "CONFIRMED", actors: ["VENDOR", "ADMIN"] },
  DENY: { from: ["AWAITING"], to: "REQUEST_DENIED", actors: ["VENDOR", "ADMIN"] },
  PAUSE: { from: ["CONFIRMED"], to: "PAUSED_BY_VENDOR", actors: ["VENDOR", "ADMIN"] },
  RESUME: { from: ["PAUSED_BY_VENDOR"], to: "CONFIRMED", actors: ["VENDOR", "ADMIN"] },
  CANCEL: {
    from: ["AWAITING", "CONFIRMED", "PAUSED_BY_VENDOR", "PRODUCT_NOT_ACTIVE"],
    to: cancelTo,
    actors: ["VENDOR", "PARTNER", "ADMIN"],
  },
  ARCHIVE_PRODUCT: {
    from: ["AWAITING", "CONFIRMED", "PAUSED_BY_VENDOR", "PRODUCT_NOT_ACTIVE"],
    to: "PRODUCT_ARCHIVED",
    actors: ["VENDOR", "ADMIN", "SYSTEM"],
  },
  SUSPEND_PLAN: { from: ["CONFIRMED", "PAUSED_BY_VENDOR"], to: "PRODUCT_NOT_ACTIVE", actors: ["SYSTEM"] },
  RESTORE_PLAN: { from: ["PRODUCT_NOT_ACTIVE"], to: "CONFIRMED", actors: ["SYSTEM"] },
};

export type TransitionResult = { ok: true; to: LinkStatus } | { ok: false; reason: "ILLEGAL_TRANSITION" | "FORBIDDEN" };

export function transitionLink(from: LinkStatus, action: LinkAction, actor: LinkActor): TransitionResult {
  const rule = LINK_RULES[action];
  if (!rule.actors.includes(actor)) return { ok: false, reason: "FORBIDDEN" };
  if (!rule.from.includes(from)) return { ok: false, reason: "ILLEGAL_TRANSITION" };
  return { ok: true, to: typeof rule.to === "function" ? rule.to(actor) : rule.to };
}

/** Actions currently offered to an actor for a link in a given state (drives the UI buttons). */
export function availableActions(from: LinkStatus, actor: LinkActor): LinkAction[] {
  return (Object.keys(LINK_RULES) as LinkAction[]).filter((a) => {
    if (a === "ARCHIVE_PRODUCT" || a === "SUSPEND_PLAN" || a === "RESTORE_PLAN") return false;
    return transitionLink(from, a, actor).ok;
  });
}

export const isTrackable = (s: LinkStatus) => s === "CONFIRMED";
