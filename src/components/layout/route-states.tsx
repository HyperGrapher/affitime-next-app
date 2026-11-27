"use client";

import { AlertTriangle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto grid max-w-md place-items-center gap-3 px-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-danger-soft text-danger"><AlertTriangle className="size-7" /></span>
      <h1 className="font-display text-2xl font-bold">Bir şeyler ters gitti</h1>
      <p className="text-sm text-muted">Sayfa yüklenirken beklenmedik bir hata oluştu.{error.digest ? ` (Ref: ${error.digest})` : ""}</p>
      <div className="mt-2 flex gap-2"><Button onClick={reset}>Tekrar dene</Button><ButtonLink href="/" variant="outline">Ana sayfa</ButtonLink></div>
    </div>
  );
}

export function RouteLoading() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Yükleniyor">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div>
      <Skeleton className="h-72" />
    </div>
  );
}
