import { z } from "zod";
import { pageInput } from "@/lib/pagination";

export const linkStatusEnum = z.enum([
  "AWAITING", "CONFIRMED", "REQUEST_DENIED", "PAUSED_BY_VENDOR", "CANCELED_BY_VENDOR",
  "CANCELED_BY_PARTNER", "CANCELED_BY_ADMIN", "PRODUCT_ARCHIVED", "PRODUCT_NOT_ACTIVE",
]);

export const linkListInput = pageInput.extend({
  status: linkStatusEnum.optional(),
  /** "live" = CONFIRMED + PAUSED; "closed" = everything terminal */
  group: z.enum(["pending", "live", "closed"]).optional(),
  productId: z.string().optional(),
});
export type LinkListInput = z.infer<typeof linkListInput>;

export const linkActionInput = z.object({
  id: z.string(),
  action: z.enum(["APPROVE", "DENY", "PAUSE", "RESUME", "CANCEL"]),
});
