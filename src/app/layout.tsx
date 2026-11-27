import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { env } from "@/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: { default: "Affitime — Affiliate pazaryeri", template: "%s · Affitime" },
  description: "Markaları satış ortaklarıyla buluşturan, takibi ve komisyon ödemelerini otomatikleştiren affiliate pazaryeri.",
  applicationName: "Affitime",
  openGraph: { type: "website", locale: "tr_TR", siteName: "Affitime" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fbfaf7" }, { media: "(prefers-color-scheme: dark)", color: "#13121a" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">İçeriğe geç</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
