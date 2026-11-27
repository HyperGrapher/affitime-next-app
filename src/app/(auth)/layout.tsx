import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link2, ShieldCheck, TrendingUp } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between"><Logo /><ThemeToggle /></div>
        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</main>
      </div>
      <aside aria-hidden className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute -left-24 -top-24 size-[28rem] rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 size-[30rem] rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center gap-8 p-14 text-primary-foreground">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">Markalar ve partnerler,<br />tek pazaryerinde.</h2>
          <ul className="grid gap-5 text-lg">
            {[[Link2, "Özel takip linkleri, anında kurulum"], [TrendingUp, "Gerçek zamanlı tıklama ve kazanç panelleri"], [ShieldCheck, "Bot ve sahte trafiğe karşı otomatik koruma"]].map(([Icon, text], i) => {
              const I = Icon as typeof Link2;
              return <li key={i} className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-xl bg-white/15"><I className="size-5" /></span>{text as string}</li>;
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
