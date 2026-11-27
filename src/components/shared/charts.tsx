"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatMoney } from "@/lib/money";
import type { DayPoint } from "@/features/visits/stats";

const axis = { stroke: "var(--muted)", fontSize: 12, tickLine: false, axisLine: false } as const;

function TooltipBox({ active, payload, label, money }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string; money?: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label ? format(new Date(label), "d MMMM", { locale: tr }) : ""}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-muted"><span className="size-2 rounded-full" style={{ background: p.color }} />{p.name}: <b className="text-foreground">{money ? formatMoney(p.value) : p.value}</b></p>
      ))}
    </div>
  );
}

const dayTick = (d: string) => format(new Date(d), "d MMM", { locale: tr });

export function ClicksChart({ data, height = 280 }: { data: DayPoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Günlük tıklama grafiği">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
        <AreaChart data={data} margin={{ left: -16, right: 4, top: 8 }}>
          <defs>
            <linearGradient id="g-clicks" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
            <linearGradient id="g-unique" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={dayTick} interval="preserveStartEnd" minTickGap={32} {...axis} />
          <YAxis allowDecimals={false} width={44} {...axis} />
          <Tooltip content={<TooltipBox />} cursor={{ stroke: "var(--border)" }} />
          <Area type="monotone" dataKey="clicks" name="Tıklama" stroke="var(--chart-1)" strokeWidth={2} fill="url(#g-clicks)" />
          <Area type="monotone" dataKey="unique" name="Tekil" stroke="var(--chart-2)" strokeWidth={2} fill="url(#g-unique)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EarningsChart({ data, height = 220 }: { data: DayPoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Günlük kazanç grafiği">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
        <BarChart data={data} margin={{ left: -8, right: 4, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={dayTick} interval="preserveStartEnd" minTickGap={32} {...axis} />
          <YAxis width={52} tickFormatter={(v: number) => `₺${v}`} {...axis} />
          <Tooltip content={<TooltipBox money />} cursor={{ fill: "var(--surface-2)" }} />
          <Bar dataKey="earnings" name="Komisyon" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
