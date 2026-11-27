import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-violet-500 to-indigo-600", "from-orange-400 to-rose-500", "from-emerald-400 to-teal-600", "from-sky-400 to-blue-600", "from-amber-400 to-orange-600", "from-fuchsia-500 to-purple-600",
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Image if present; otherwise a deterministic gradient tile with initials. Works offline and with no storage. */
export function Avatar({ name, src, className, rounded = "full" }: { name: string; src?: string | null; className?: string; rounded?: "full" | "lg" }) {
  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- avatar hosts are user-provided; plain <img> avoids image-optimizer host restrictions
    return <img src={src} alt="" className={cn("size-9 shrink-0 object-cover", radius, className)} />;
  }
  const initials = name.split(/[\s_.-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toLocaleUpperCase("tr")).join("");
  return (
    <span aria-hidden className={cn("inline-flex size-9 shrink-0 items-center justify-center bg-gradient-to-br text-xs font-bold text-white", GRADIENTS[hash(name) % GRADIENTS.length], radius, className)}>
      {initials || "?"}
    </span>
  );
}

export function ProductThumb({ title, src, className }: { title: string; src?: string | null; className?: string }) {
  return <Avatar name={title} src={src} rounded="lg" className={cn("size-12", className)} />;
}
