import { BadgeCheck, Link2, MousePointerClick, TrendingUp } from "lucide-react";

const POINTS = [18, 26, 22, 34, 30, 44, 40, 58, 52, 70, 64, 86];

/** Decorative product preview, pure SVG/CSS – no images, no layout shift. */
export function HeroVisual() {
  const max = Math.max(...POINTS);
  const path = POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (POINTS.length - 1)) * 300},${100 - (p / max) * 90}`).join(" ");
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-accent/20 to-transparent blur-2xl" />
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-muted">Bu hafta</p><p className="font-display text-3xl font-extrabold tracking-tight tabular-nums">₺4.286<span className="text-lg text-muted">,50</span></p></div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success"><TrendingUp className="size-3.5" /> %24</span>
        </div>
        <svg viewBox="0 0 300 100" className="mt-4 h-28 w-full" preserveAspectRatio="none">
          <defs><linearGradient id="hv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".35" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
          <path d={`${path} L300,100 L0,100 Z`} fill="url(#hv)" />
          <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-2 p-3"><p className="flex items-center gap-1.5 text-xs text-muted"><MousePointerClick className="size-3.5" /> Tıklama</p><p className="text-lg font-bold tabular-nums">12.840</p></div>
          <div className="rounded-xl bg-surface-2 p-3"><p className="flex items-center gap-1.5 text-xs text-muted"><Link2 className="size-3.5" /> Aktif link</p><p className="text-lg font-bold tabular-nums">38</p></div>
        </div>
      </div>
      <div className="absolute -right-3 -top-6 hidden animate-float items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-sm shadow-xl sm:flex">
        <span className="grid size-8 place-items-center rounded-full bg-success-soft text-success"><BadgeCheck className="size-4" /></span>
        <div><p className="text-xs text-muted">Yeni komisyon</p><p className="font-bold tabular-nums">+₺12,50</p></div>
      </div>
      <div className="absolute -left-5 bottom-8 hidden animate-float items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs shadow-xl [animation-delay:-3s] sm:flex">
        <span className="font-mono font-semibold text-primary">affitime.com/r/ayse4X9k</span>
      </div>
    </div>
  );
}
