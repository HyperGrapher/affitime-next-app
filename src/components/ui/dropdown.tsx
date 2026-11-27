"use client";

import { Menu } from "@base-ui/react/menu";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = Menu.Root;
export const DropdownTrigger = Menu.Trigger;

export function DropdownContent({ children, className, align = "end" }: { children: ReactNode; className?: string; align?: "start" | "end" | "center" }) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={8} align={align} className="z-50">
        <Menu.Popup className={cn("min-w-52 origin-[var(--transform-origin)] rounded-xl border border-border bg-surface p-1.5 shadow-xl outline-none transition duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0", className)}>
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function DropdownItem({ className, ...props }: ComponentProps<typeof Menu.Item>) {
  return <Menu.Item className={cn("flex cursor-default select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted", className)} {...props} />;
}

export function DropdownSeparator() {
  return <Menu.Separator className="my-1 h-px bg-border" />;
}
