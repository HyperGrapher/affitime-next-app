"use server";

import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { env } from "@/env";
import { getViewer } from "@/server/session";
import { routes } from "@/lib/routes";

/** DEMO_MODE only: jump straight to the verification link that was "e-mailed" (it is in the Outbox). */
export async function demoVerify() {
  if (!env.DEMO_MODE) throw new Error("Demo mode is disabled");
  const viewer = await getViewer();
  if (!viewer) redirect(routes.signin);
  const mail = await db.sentEmail.findFirst({ where: { to: viewer.email, kind: "VERIFY_EMAIL" }, orderBy: { createdAt: "desc" } });
  const url = mail?.text.match(/https?:\/\/\S+/)?.[0];
  if (!url) redirect(routes.notVerified);
  redirect(url);
}
