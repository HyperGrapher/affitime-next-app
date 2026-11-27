/** ISO 7064 mod-97 check for Turkish IBANs (TR + 24 digits). */
export function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function isValidTrIban(raw: string): boolean {
  const iban = normalizeIban(raw);
  if (!/^TR\d{24}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

export function formatIban(raw: string): string {
  return normalizeIban(raw).replace(/(.{4})/g, "$1 ").trim();
}

export function maskIban(raw: string | null | undefined): string {
  if (!raw) return "–";
  const n = normalizeIban(raw);
  return `${n.slice(0, 4)} •••• •••• •••• ${n.slice(-4)}`;
}
