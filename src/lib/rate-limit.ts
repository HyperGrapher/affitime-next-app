import { db } from "@/server/db";

// 1) In-memory sliding window: zero-latency, per serverless instance. Good for the hot /r path as a burst shield.
const buckets = new Map<string, number[]>();

export function memoryRateLimit(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const k of buckets.keys()) { buckets.delete(k); if (buckets.size < 2500) break; }
  return true;
}

// 2) Database fixed window: shared across instances. Used for sign-up, contact form, store API.
export async function dbRateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const now = Date.now();
  const id = `app:${key}`;
  const row = await db.rateLimit.findUnique({ where: { key: id } });
  if (!row || now - Number(row.lastRequest) > windowSec * 1000) {
    await db.rateLimit.upsert({
      where: { key: id },
      create: { id, key: id, count: 1, lastRequest: BigInt(now) },
      update: { count: 1, lastRequest: BigInt(now) },
    });
    return true;
  }
  if (row.count >= max) return false;
  await db.rateLimit.update({ where: { key: id }, data: { count: { increment: 1 } } });
  return true;
}
