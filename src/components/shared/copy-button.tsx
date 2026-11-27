"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label = "Kopyala" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button variant="outline" size="sm" onClick={async () => { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1800); }} aria-live="polite">
      {done ? <Check /> : <Copy />} {done ? "Kopyalandı" : label}
    </Button>
  );
}
