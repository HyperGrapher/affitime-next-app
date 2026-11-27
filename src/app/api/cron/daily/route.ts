import { NextResponse } from "next/server";
import { env } from "@/env";
import { db } from "@/server/db";
import { safeEqual } from "@/lib/crypto";
import { runDailyJob } from "@/features/dashboard/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Idempotent: safe to call repeatedly. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (!safeEqual(auth, `Bearer ${env.CRON_SECRET}`)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const stats = await runDailyJob(db);
  return NextResponse.json({ ok: true, ...stats });
}
