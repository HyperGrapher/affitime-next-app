import { sha256 } from "./crypto";
import { env } from "@/env";

/** Client IP from platform headers (Vercel sets x-forwarded-for / x-real-ip). */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "0.0.0.0";
}

export function getCountry(headers: Headers): string {
  return (headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "-").toUpperCase();
}

/** Salted hash – raw IPs are not stored (KVKK/GDPR data minimisation). */
export const hashIp = (ip: string) => sha256(`${env.BETTER_AUTH_SECRET}:${ip}`);

export function maskIp(ip: string): string {
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + ":…";
  const p = ip.split(".");
  return p.length === 4 ? `${p[0]}.${p[1]}.${p[2]}.•` : "•";
}
