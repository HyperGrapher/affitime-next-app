"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, KeyRound, RefreshCw, Terminal } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { CopyButton } from "@/components/shared/copy-button";
import { formatDateTime } from "@/lib/dates";
import { errorMessage, notifyError } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { env } from "@/lib/public-env";

export function StoreApiView() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.account.storeApi.queryOptions());
  const [secret, setSecret] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const rotate = useMutation(trpc.account.rotateStoreApiKey.mutationOptions({
    onSuccess: (r) => { setSecret(r.secret); setConfirm(false); void qc.invalidateQueries({ queryKey: trpc.account.storeApi.queryKey() }); },
    onError: (e) => notifyError(errorMessage(e)),
  }));
  const curl = `curl -H "Authorization: Bearer ${secret ?? "affi_…"}" ${env.appUrl}/api/store/v1/status`;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div><CardTitle>Mağaza API anahtarı</CardTitle><CardDescription>Mağaza eklentiniz bu anahtarla Affitime&apos;a bağlanır ve takibin aktif olup olmadığını öğrenir.</CardDescription></div>
          {data.exists ? <Badge tone={data.installedAt ? "success" : "warning"}>{data.installedAt ? "Bağlandı" : "Bağlantı bekleniyor"}</Badge> : <Badge>Anahtar yok</Badge>}
        </CardHeader>
        <CardContent className="grid gap-4">
          {secret ? (
            <div role="status" className="rounded-xl border border-success/40 bg-success-soft p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="size-4" /> Anahtarınızı şimdi kopyalayın — bir daha gösterilmez.</p>
              <div className="flex flex-wrap items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-lg bg-surface px-3 py-2 font-mono text-sm">{secret}</code><CopyButton value={secret} /></div>
            </div>
          ) : data.exists ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-4 text-sm"><KeyRound className="size-4 text-muted" /><code className="font-mono">{data.prefix}…••••••••</code><span className="text-muted">· oluşturulma {formatDateTime(data.createdAt)}{data.lastUsedAt ? ` · son kullanım ${formatDateTime(data.lastUsedAt)}` : ""}</span></div>
          ) : <p className="text-sm text-muted">Henüz anahtar oluşturmadınız.</p>}
          <div><Button variant={data.exists ? "outline" : "primary"} onClick={() => (data.exists ? setConfirm(true) : rotate.mutate())} disabled={rotate.isPending}><RefreshCw /> {data.exists ? "Anahtarı yenile" : "Anahtar oluştur"}</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div><CardTitle className="flex items-center gap-2"><Terminal className="size-4" /> Bağlantıyı test edin</CardTitle><CardDescription>İlk başarılı istekte mağazanız “bağlandı” olarak işaretlenir. Plan bittiğinde yanıt <code>tracking:false</code> döner.</CardDescription></div></CardHeader>
        <CardContent><pre className="overflow-x-auto rounded-xl bg-surface-2 p-4 font-mono text-xs leading-relaxed">{curl}</pre></CardContent>
      </Card>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} destructive pending={rotate.isPending} title="Anahtar yenilensin mi?" description="Mevcut anahtar hemen geçersiz olur; mağaza eklentinizi yeni anahtarla güncellemeniz gerekir." confirmLabel="Yenile" onConfirm={() => rotate.mutate()} />
    </div>
  );
}
