"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { DropdownContent, DropdownItem, DropdownMenu, DropdownTrigger } from "./dropdown";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

const subscribe = () => () => undefined;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const Icon = !mounted ? Sun : theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;
  return (
    <DropdownMenu>
      <DropdownTrigger aria-label="Tema" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), className)}>
        <Icon />
      </DropdownTrigger>
      <DropdownContent>
        <DropdownItem onClick={() => setTheme("light")}><Sun /> Açık</DropdownItem>
        <DropdownItem onClick={() => setTheme("dark")}><Moon /> Koyu</DropdownItem>
        <DropdownItem onClick={() => setTheme("system")}><Monitor /> Sistem</DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}
