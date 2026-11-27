"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { LinkStatusBadge } from "@/components/shared/badges";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import type { LinkStatus } from "@/generated/prisma/client";

export function RequestLinkButton({ productId, existing }: { productId: string; existing: { id: string; status: LinkStatus } | null }) {
  const trpc = useTRPC();
  const router = useRouter();
  const qc = useQueryClient();
  const request = useMutation(trpc.links.request.mutationOptions({
    onSuccess: (r) => { notifySuccess("Başvurunuz markaya iletildi"); void qc.invalidateQueries({ queryKey: trpc.links.pathKey() }); router.push(routes.partner.link(r.id)); },
    onError: (e) => notifyError(errorMessage(e)),
  }));
  if (existing) {
    return (
      <div className="grid gap-3"><div className="flex items-center justify-between text-sm"><span className="text-muted">Durum</span><LinkStatusBadge status={existing.status} /></div><ButtonLink href={routes.partner.link(existing.id)} variant="outline" className="w-full">Linkime git</ButtonLink></div>
    );
  }
  return <Button size="lg" className="w-full" disabled={request.isPending} onClick={() => request.mutate({ productId })}>{request.isPending ? "Gönderiliyor…" : "Link talep et"}</Button>;
}
