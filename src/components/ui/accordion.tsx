"use client";

import { Accordion as Base } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionEntry { id: string | number; question: string; answer: string }

export function Accordion({ items, className }: { items: AccordionEntry[]; className?: string }) {
  return (
    <Base.Root className={cn("divide-y divide-border rounded-2xl border border-border bg-surface", className)}>
      {items.map((it) => (
        <Base.Item key={it.id} value={String(it.id)}>
          <Base.Header>
            <Base.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold hover:text-primary">
              {it.question}
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-data-[panel-open]:rotate-180" />
            </Base.Trigger>
          </Base.Header>
          <Base.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-muted transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0">
            <p className="px-5 pb-5 leading-relaxed">{it.answer}</p>
          </Base.Panel>
        </Base.Item>
      ))}
    </Base.Root>
  );
}
