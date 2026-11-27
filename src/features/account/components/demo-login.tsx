import { Sparkles } from "lucide-react";
import { demoLogin } from "../demo-action";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

const GROUPS = [
  { role: "VENDOR", title: "Marka olarak keşfet" },
  { role: "PARTNER", title: "Partner olarak keşfet" },
  { role: "ADMIN", title: "Yönetim" },
] as const;

export function DemoLogin() {
  return (
    <section aria-labelledby="demo-title" className="mt-8 rounded-2xl border border-dashed border-accent/60 bg-accent-soft/50 p-4">
      <h2 id="demo-title" className="flex items-center gap-2 text-sm font-bold text-accent"><Sparkles className="size-4" /> Demo modu — tek tıkla giriş</h2>
      <form action={demoLogin} className="mt-3 grid gap-3">
        {GROUPS.map((g) => (
          <div key={g.role}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{g.title}</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.filter((a) => (g.role === "ADMIN" ? a.role === "ADMIN" || a.role === "MODERATOR" : a.role === g.role)).map((a) => (
                <button key={a.key} type="submit" name="key" value={a.key} title={a.hint} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium transition hover:border-primary hover:text-primary">
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </form>
    </section>
  );
}
