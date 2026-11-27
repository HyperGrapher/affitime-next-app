import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sha256 } from "@/lib/crypto";
import { dbRateLimit } from "@/lib/rate-limit";
import { getPlanStatus, isPlanActive } from "@/domain/plan";

export const dynamic = "force-dynamic";

/**
 * Store-plugin API. `Authorization: Bearer affi_…`.
 * First successful call marks the store as installed; the response tells the store whether tracking is active
 * (replaces the legacy "?affi=true&err=true&msg=eop|eot" callbacks).
 */
export async function GET(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token.startsWith("affi_")) return NextResponse.json({ error: "invalid_key" }, { status: 401 });
  const keyHash = sha256(token);

  if (!(await dbRateLimit(`store:${keyHash.slice(0, 16)}`, 60, 60))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const key = await db.apiKey.findUnique({ where: { keyHash }, include: { vendor: true } });
  if (!key) return NextResponse.json({ error: "invalid_key" }, { status: 401 });

  const now = new Date();
  await db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: now, installedAt: key.installedAt ?? now } });
  const plan = getPlanStatus(key.vendor, now);
  return NextResponse.json({
    ok: true,
    brand: key.vendor.brand,
    tracking: isPlanActive(plan),
    state: plan.state,
    code: isPlanActive(plan) ? "ok" : plan.state === "PLAN_ENDED" ? "eop" : "eot",
  });
}
