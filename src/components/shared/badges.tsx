import type { LinkStatus, PaymentStatus, VisitFlag } from "@/generated/prisma/client";
import { Badge, type Tone } from "@/components/ui/badge";
import type { PlanStatus } from "@/domain/plan";
import { t } from "@/i18n";

const LINK_TONE: Record<LinkStatus, Tone> = {
  AWAITING: "warning", CONFIRMED: "success", REQUEST_DENIED: "danger", PAUSED_BY_VENDOR: "warning", CANCELED_BY_VENDOR: "neutral",
  CANCELED_BY_PARTNER: "neutral", CANCELED_BY_ADMIN: "danger", PRODUCT_ARCHIVED: "neutral", PRODUCT_NOT_ACTIVE: "accent",
};

export const LinkStatusBadge = ({ status }: { status: LinkStatus }) => <Badge tone={LINK_TONE[status]}>{t.linkStatus[status]}</Badge>;

const PAY_TONE: Record<PaymentStatus, Tone> = { PENDING: "warning", SUCCEEDED: "success", FAILED: "danger" };
export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => <Badge tone={PAY_TONE[status]}>{t.paymentStatus[status]}</Badge>;

export const VisitFlagBadge = ({ flag }: { flag: VisitFlag }) => <Badge tone="danger">{t.visitFlag[flag]}</Badge>;

export function PlanBadge({ plan }: { plan: PlanStatus | null }) {
  if (!plan) return null;
  const label = plan.state === "PLAN" || plan.state === "PLAN_ENDED" ? `${t.plan[plan.plan]} · ${t.plan.state[plan.state]}` : t.plan.state[plan.state];
  return <Badge tone={plan.state === "PLAN" ? "success" : plan.state === "TRIAL" ? "primary" : "danger"}>{label}</Badge>;
}
