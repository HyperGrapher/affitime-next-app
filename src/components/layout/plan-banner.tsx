import { AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import type { PlanStatus } from "@/domain/plan";
import { daysUntil, formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";

/** Slim, always-visible vendor plan reminder. Server component. */
export function PlanBanner({ plan }: { plan: PlanStatus }) {
  if (plan.state === "PLAN" && daysUntil(plan.endsAt) > 7) return null;

  const ended = plan.state === "TRIAL_ENDED" || plan.state === "PLAN_ENDED";
  const text =
    plan.state === "TRIAL" ? `Deneme süreniz ${daysUntil(plan.endsAt)} gün sonra (${formatDate(plan.endsAt)}) bitiyor.`
    : plan.state === "PLAN" ? `Planınız ${daysUntil(plan.endsAt)} gün sonra (${formatDate(plan.endsAt)}) sona eriyor.`
    : plan.state === "TRIAL_ENDED" ? "Deneme süreniz bitti. Partner linkleriniz durduruldu."
    : "Planınız sona erdi. Partner linkleriniz durduruldu.";
  const Icon = ended ? AlertTriangle : Clock;
  return (
    <div role="status" className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm font-medium ${ended ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}>
      <Icon className="size-4" />
      <span>{text}</span>
      <Link href={routes.billing.plans} className="font-bold underline underline-offset-2">{ended ? "Planı yenile" : "Plan seç"}</Link>
    </div>
  );
}
