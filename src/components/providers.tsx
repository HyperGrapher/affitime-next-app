"use client";

import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NextTopLoader color="var(--primary)" height={2} showSpinner={false} shadow={false} />
      <TRPCReactProvider>{children}</TRPCReactProvider>
      <Toaster richColors position="top-right" closeButton />
    </ThemeProvider>
  );
}
