import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
export const hmacBase64 = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("base64");

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export const randomCode = (bytes = 6) => randomBytes(bytes).toString("base64url");
export const randomRef = (prefix: string) => `${prefix}${Date.now().toString(36).toUpperCase()}${randomBytes(4).toString("hex").toUpperCase()}`;
