import type { Db } from "@/server/db";
import type { EmailKind, NotificationType, Prisma } from "@/generated/prisma/client";
import { getPlanStatus } from "@/domain/plan";
import { PLAN_WARNING_DAYS, TRIAL_WARNING_DAYS } from "@/domain/pricing";
import { addDays, formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { notify } from "@/features/notifications/service";
import { sendTemplatedEmail } from "@/server/services/email";

interface Job { userId: string; kind: EmailKind; refDate: Date; meta: Record<string, string>; notification: NotificationType; href: string }

/** Insert-if-absent. Returns true only for the run that really created the row → notifications are sent once. */
async function enqueue(db: Db, job: Job): Promise<boolean> {
  const res = await db.emailQueue.createMany({ data: [{ userId: job.userId, kind: job.kind, refDate: job.refDate, meta: job.meta as Prisma.InputJsonValue }], skipDuplicates: true });
  if (res.count === 1) await notify(db, job.userId, job.notification, job.meta, job.href);
  return res.count === 1;
}

/**
 * Daily job (Vercel Cron). Fully idempotent:
 *  - queue rows are unique per (user, kind, refDate)
 *  - link suspension is a conditional bulk update
 *  - the flush step only sends rows with sentAt = null and marks them immediately after
 */
export async function runDailyJob(db: Db, now = new Date()) {
  const stats = { queued: 0, sent: 0, suspendedLinks: 0, endedCampaigns: 0 };

  const vendors = await db.vendor.findMany({ include: { user: { select: { id: true } } } });
  for (const v of vendors) {
    const s = getPlanStatus(v, now);
    const userId = v.user.id;
    const base = { brand: v.brand };
    const jobs: Job[] = [];
    if (s.state === "TRIAL" && addDays(now, TRIAL_WARNING_DAYS) >= s.endsAt)
      jobs.push({ userId, kind: "TRIAL_ENDING_SOON", refDate: s.endsAt, meta: { ...base, date: formatDate(s.endsAt), url: routes.billing.plans }, notification: "TRIAL_ENDING_SOON", href: routes.billing.plans });
    if (s.state === "PLAN" && addDays(now, PLAN_WARNING_DAYS) >= s.endsAt)
      jobs.push({ userId, kind: "PLAN_ENDING_SOON", refDate: s.endsAt, meta: { ...base, plan: s.plan, date: formatDate(s.endsAt), url: routes.billing.plans }, notification: "PLAN_ENDING_SOON", href: routes.billing.plans });
    if (s.state === "TRIAL_ENDED")
      jobs.push({ userId, kind: "TRIAL_ENDED", refDate: s.endedAt, meta: { ...base, url: routes.billing.plans }, notification: "TRIAL_ENDED", href: routes.billing.plans });
    if (s.state === "PLAN_ENDED")
      jobs.push({ userId, kind: "PLAN_ENDED", refDate: s.endedAt, meta: { ...base, url: routes.billing.plans }, notification: "PLAN_ENDED", href: routes.billing.plans });
    for (const j of jobs) if (await enqueue(db, j)) stats.queued++;

    if (s.state === "TRIAL_ENDED" || s.state === "PLAN_ENDED") {
      for (const from of ["CONFIRMED", "PAUSED_BY_VENDOR"] as const) {
        const r = await db.link.updateMany({ where: { vendorId: v.id, status: from }, data: { status: "PRODUCT_NOT_ACTIVE", suspendedFrom: from } });
        stats.suspendedLinks += r.count;
      }
    }
  }

  const ended = await db.campaign.findMany({ where: { status: "ACTIVE", endsAt: { lte: now } }, include: { product: { select: { title: true } }, vendor: { select: { brand: true, userId: true } } } });
  for (const c of ended) {
    const claimed = await db.campaign.updateMany({ where: { id: c.id, status: "ACTIVE" }, data: { status: "ENDED" } });
    if (claimed.count === 0) continue;
    stats.endedCampaigns++;
    if (await enqueue(db, { userId: c.vendor.userId, kind: "CAMPAIGN_ENDED", refDate: c.endsAt, meta: { brand: c.vendor.brand, product: c.product.title }, notification: "CAMPAIGN_ENDED", href: routes.vendor.products })) stats.queued++;
  }

  const due = await db.emailQueue.findMany({ where: { sentAt: null }, include: { user: { select: { email: true, name: true } } }, take: 200, orderBy: { id: "asc" } });
  for (const q of due) {
    const claimed = await db.emailQueue.updateMany({ where: { id: q.id, sentAt: null }, data: { sentAt: now } });
    if (claimed.count === 0) continue;
    await sendTemplatedEmail(q.kind, q.user.email, (q.meta ?? {}) as Record<string, string>, q.user.name);
    stats.sent++;
  }
  return stats;
}
