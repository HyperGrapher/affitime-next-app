import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d="M8 22 14.2 9.5a1.9 1.9 0 0 1 3.4 0L24 22" fill="none" stroke="var(--primary-foreground)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21.6" cy="21.4" r="3" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight", className)}>
      <LogoMark />
      Affitime
    </Link>
  );
}
