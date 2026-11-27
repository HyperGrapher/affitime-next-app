import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getPaymentProvider } from "@/providers/payment";
import { applyCallback } from "@/features/payments/service";
import { env } from "@/env";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

/**
 * Provider callback (PayTR-style form POST). Signature verified by the provider adapter; processing is idempotent.
 * Always answers "OK" for valid signatures (even replays) so the provider stops retrying.
 */
export async function POST(req: Request) {
  const form = Object.fromEntries([...(await req.formData()).entries()].map(([k, v]) => [k, String(v)]));
  const payload = getPaymentProvider().parseCallback(form);
  if (!payload) return new NextResponse("INVALID_SIGNATURE", { status: 400 });

  await applyCallback(db, payload);

  // Browser-initiated callback (simulated hosted checkout): continue to the result page.
  const returnTo = form.return_to;
  if (returnTo === routes.billing.result(payload.ref)) return NextResponse.redirect(new URL(returnTo, env.NEXT_PUBLIC_APP_URL), 303);
  return new NextResponse("OK", { status: 200 });
}
