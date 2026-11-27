import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, hint, tone = "primary", className }: { label: string; value: ReactNode; icon?: LucideIcon; hint?: ReactNode; tone?: "primary" | "accent" | "success" | "warning"; className?: string }) {
  const tones = { primary: "bg-primary-soft text-primary", accent: "bg-accent-soft text-accent", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning" };
  return (
    <Card className={cn("flex items-start justify-between gap-3 p-5", className)}>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
      {Icon ? <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone])}><Icon className="size-5" /></span> : null}
    </Card>
  );
}
