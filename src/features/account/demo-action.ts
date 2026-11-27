"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { env } from "@/env";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";
import { homeForRole } from "@/lib/routes";

/** One-click demo login. Hard-gated by DEMO_MODE; Better Auth sets the session cookie through the nextCookies plugin. */
export async function demoLogin(formData: FormData) {
  if (!env.DEMO_MODE) throw new Error("Demo mode is disabled");
  const account = DEMO_ACCOUNTS.find((a) => a.key === formData.get("key"));
  if (!account) throw new Error("Unknown demo account");
  await auth.api.signInEmail({ body: { email: account.email, password: DEMO_PASSWORD }, headers: await headers() });
  redirect(homeForRole(account.role));
}
