import { Prisma } from "@/generated/prisma/client";
import type { Db } from "@/server/db";
import { addDays, startOfDay } from "@/lib/dates";
import { toNumber } from "@/lib/money";

export type VisitScope = { linkId: string } | { vendorId: string } | { partnerId: string } | { all: true };

function scopeSql(scope: VisitScope): Prisma.Sql {
  if ("linkId" in scope) return Prisma.sql`"linkId" = ${scope.linkId}`;
  if ("vendorId" in scope) return Prisma.sql`"vendorId" = ${scope.vendorId}`;
  if ("partnerId" in scope) return Prisma.sql`"partnerId" = ${scope.partnerId}`;
  return Prisma.sql`TRUE`;
}

export interface DayPoint { date: string; clicks: number; unique: number; earnings: number }

/** Daily clicks / unique clicks / earnings for the last `days` days, zero-filled. One aggregate query. */
export async function visitSeries(db: Db, scope: VisitScope, days = 30, now = new Date()): Promise<DayPoint[]> {
  const from = startOfDay(addDays(now, -(days - 1)));
  const rows = await db.$queryRaw<{ day: Date; clicks: bigint; uniq: bigint; earnings: Prisma.Decimal | null }[]>`
    SELECT date_trunc('day', "createdAt") AS day,
           count(*) AS clicks,
           count(*) FILTER (WHERE "isUnique" AND flag IS NULL) AS uniq,
           coalesce(sum(commission) FILTER (WHERE billable), 0) AS earnings
    FROM visit
    WHERE ${scopeSql(scope)} AND "createdAt" >= ${from}
    GROUP BY 1 ORDER BY 1`;
  const byDay = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), r]));
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(from, i);
    const key = d.toISOString().slice(0, 10);
    const r = byDay.get(key);
    return { date: key, clicks: Number(r?.clicks ?? 0), unique: Number(r?.uniq ?? 0), earnings: toNumber(r?.earnings) };
  });
}

export interface VisitTotals { clicks: number; unique: number; flagged: number; unpaid: number; paid: number }

export async function visitTotals(db: Db, scope: VisitScope): Promise<VisitTotals> {
  const [row] = await db.$queryRaw<{ clicks: bigint; uniq: bigint; flagged: bigint; unpaid: Prisma.Decimal | null; paid: Prisma.Decimal | null }[]>`
    SELECT count(*) AS clicks,
           count(*) FILTER (WHERE "isUnique" AND flag IS NULL) AS uniq,
           count(*) FILTER (WHERE flag IS NOT NULL) AS flagged,
           coalesce(sum(commission) FILTER (WHERE billable AND "payoutId" IS NULL), 0) AS unpaid,
           coalesce(sum(commission) FILTER (WHERE billable AND "payoutId" IS NOT NULL), 0) AS paid
    FROM visit WHERE ${scopeSql(scope)}`;
  return {
    clicks: Number(row?.clicks ?? 0),
    unique: Number(row?.uniq ?? 0),
    flagged: Number(row?.flagged ?? 0),
    unpaid: toNumber(row?.unpaid),
    paid: toNumber(row?.paid),
  };
}

export async function topCountries(db: Db, scope: VisitScope, limit = 5) {
  const rows = await db.$queryRaw<{ country: string; n: bigint }[]>`
    SELECT country, count(*) AS n FROM visit WHERE ${scopeSql(scope)} AND flag IS NULL
    GROUP BY country ORDER BY n DESC LIMIT ${limit}`;
  return rows.map((r) => ({ country: r.country, clicks: Number(r.n) }));
}
