"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({ title, description, children, className, side = "center" }: { title: string; description?: string; children?: ReactNode; className?: string; side?: "center" | "left" }) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          "fixed z-50 border border-border bg-surface shadow-2xl outline-none transition-all duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          side === "center"
            ? "left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 data-[ending-style]:scale-95 data-[starting-style]:scale-95"
            : "inset-y-0 left-0 w-[min(20rem,85vw)] p-0 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
          className,
        )}
      >
        <BaseDialog.Title className={cn("text-lg font-semibold tracking-tight", side === "left" && "sr-only")}>{title}</BaseDialog.Title>
        {description ? <BaseDialog.Description className="mt-1 text-sm text-muted">{description}</BaseDialog.Description> : null}
        <div className={side === "center" ? "mt-4" : ""}>{children}</div>
        {side === "center" ? (
          <BaseDialog.Close aria-label="Kapat" className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground">
            <X className="size-4" />
          </BaseDialog.Close>
        ) : null}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

/** Keyboard-operable confirm dialog (focus trap + Esc from Base UI). */
export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = "Onayla", cancelLabel = "Vazgeç", destructive, pending, onConfirm,
}: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; pending?: boolean; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title} description={description}>
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="outline">{cancelLabel}</Button>} />
          <Button variant={destructive ? "danger" : "primary"} disabled={pending} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
