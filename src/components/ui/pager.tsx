"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export function Pager({ page, pageCount, total, onPage }: { page: number; pageCount: number; total?: number; onPage: (p: number) => void }) {
  if (pageCount <= 1) return total !== undefined ? <p className="px-1 text-sm text-muted">{total} kayıt</p> : null;
  return (
    <nav aria-label="Sayfalama" className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted" aria-live="polite">
        Sayfa {page} / {pageCount}
        {total !== undefined ? ` · ${total} kayıt` : ""}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Önceki sayfa"><ChevronLeft /> Önceki</Button>
        <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)} aria-label="Sonraki sayfa">Sonraki <ChevronRight /></Button>
      </div>
    </nav>
  );
}
