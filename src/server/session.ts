import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { getPlanStatus, type PlanStatus } from "@/domain/plan";
import type { Role } from "@/generated/prisma/client";

export interface Viewer {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  emailVerified: boolean;
  vendor: { id: string; brand: string; logo: string | null; plan: PlanStatus } | null;
  partner: { id: string; username: string; avatar: string | null; onboarded: boolean } | null;
}

/** Cached per request. Resolves the session cookie plus the role profile. */
export const getViewer = cache(async (): Promise<Viewer | null> => loadViewer(await headers()));

export async function loadViewer(h: Headers): Promise<Viewer | null> {
  const session = await auth.api.getSession({ headers: h });
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { vendor: true, partner: true },
  });
  if (!user || !user.active) return null;
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
    vendor: user.vendor
      ? { id: user.vendor.id, brand: user.vendor.brand, logo: user.vendor.logo, plan: getPlanStatus(user.vendor) }
      : null,
    partner: user.partner
      ? { id: user.partner.id, username: user.partner.username, avatar: user.partner.avatar, onboarded: user.partner.onboarded }
      : null,
  };
}
