"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkStatusBadge, PlanBadge } from "@/components/shared/badges";
import { PaymentHistory } from "@/features/payments/components/payments-views";
import { useDebounced } from "@/hooks/use-debounced";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { t } from "@/i18n";

function Toolbar({ q, setQ, children }: { q: string; setQ: (v: string) => void; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-52 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input aria-label="Ara" placeholder="Ara…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {children}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <Card><div className="overflow-x-auto"><table className="w-full min-w-[40rem] text-sm">
      <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-border">{children}</tbody>
    </table></div></Card>
  );
}

const Loading = () => <Skeleton className="h-64" />;

export function UsersAdmin({ canEdit }: { canEdit: boolean }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"VENDOR" | "PARTNER" | "ADMIN" | "MODERATOR" | "">("");
  const dq = useDebounced(q);
  const query = useQuery({ ...trpc.admin.users.queryOptions({ page, pageSize: 12, q: dq || undefined, role: role || undefined }), placeholderData: (p) => p });
  const toggle = useMutation(trpc.admin.setUserActive.mutationOptions({ onSuccess: () => { notifySuccess("Kullanıcı güncellendi"); void qc.invalidateQueries({ queryKey: trpc.admin.pathKey() }); }, onError: (e) => notifyError(errorMessage(e)) }));
  return (
    <div className="grid gap-4">
      <Toolbar q={q} setQ={(v) => { setQ(v); setPage(1); }}>
        <Select aria-label="Rol" className="w-full sm:w-44" value={role} onChange={(e) => { setRole(e.target.value as typeof role); setPage(1); }}><option value="">Tüm roller</option>{(["VENDOR", "PARTNER", "ADMIN", "MODERATOR"] as const).map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}</Select>
      </Toolbar>
      {query.isPending ? <Loading /> : (
        <Table head={["Kullanıcı", "Rol", "Plan", "Durum", "Kayıt", ""]}>
          {query.data?.items.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3"><p className="font-semibold">{u.name}</p><p className="text-xs text-muted">{u.email}</p></td>
              <td className="px-4 py-3"><Badge tone="primary">{t.roles[u.role]}</Badge></td>
              <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
              <td className="px-4 py-3">{u.active ? <Badge tone="success">Aktif</Badge> : <Badge tone="danger">Devre dışı</Badge>}{!u.emailVerified ? <Badge tone="warning" className="ml-1">Doğrulanmamış</Badge> : null}</td>
              <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3 text-right">{canEdit && u.role !== "ADMIN" ? <Button size="sm" variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: u.id, active: !u.active })}>{u.active ? "Devre dışı bırak" : "Etkinleştir"}</Button> : null}</td>
            </tr>
          ))}
        </Table>
      )}
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}
    </div>
  );
}

export function ProductsAdmin() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<{ id: string; title: string } | null>(null);
  const dq = useDebounced(q);
  const query = useQuery({ ...trpc.admin.products.queryOptions({ page, pageSize: 12, q: dq || undefined }), placeholderData: (p) => p });
  const archive = useMutation(trpc.admin.archiveProduct.mutationOptions({ onSuccess: () => { notifySuccess("Ürün arşivlendi"); setTarget(null); void qc.invalidateQueries({ queryKey: trpc.admin.pathKey() }); }, onError: (e) => notifyError(errorMessage(e)) }));
  return (
    <div className="grid gap-4">
      <Toolbar q={q} setQ={(v) => { setQ(v); setPage(1); }} />
      {query.isPending ? <Loading /> : (
        <Table head={["Ürün", "Marka", "Kategori", "Fiyat", "Link", "Durum", ""]}>
          {query.data?.items.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-semibold">{p.title}</td><td className="px-4 py-3">{p.brand}</td><td className="px-4 py-3 text-muted">{p.category}</td>
              <td className="px-4 py-3 tabular-nums">{formatMoney(p.price)}</td><td className="px-4 py-3">{p.links}</td>
              <td className="px-4 py-3">{p.status === "ACTIVE" ? <Badge tone="success">Aktif</Badge> : <Badge>Arşiv</Badge>}</td>
              <td className="px-4 py-3 text-right">{p.status === "ACTIVE" ? <Button size="sm" variant="outline" aria-label="Arşivle" onClick={() => setTarget({ id: p.id, title: p.title })}><Trash2 /></Button> : null}</td>
            </tr>
          ))}
        </Table>
      )}
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}
      <ConfirmDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)} destructive pending={archive.isPending} title="Ürün arşivlensin mi?" description={`“${target?.title ?? ""}” ve bağlı partner linkleri kapatılır.`} confirmLabel="Arşivle" onConfirm={() => target && archive.mutate({ id: target.id })} />
    </div>
  );
}

export function PaymentsAdmin() {
  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState<"PLAN" | "CAMPAIGN" | "PAYOUT" | "">("");
  const [status, setStatus] = useState<"PENDING" | "SUCCEEDED" | "FAILED" | "">("");
  const query = useQuery({ ...trpc.payments.adminList.queryOptions({ page, pageSize: 12, kind: kind || undefined, status: status || undefined }), placeholderData: (p) => p });
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <Select aria-label="Tür" className="w-full sm:w-48" value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setPage(1); }}><option value="">Tüm türler</option>{(["PLAN", "CAMPAIGN", "PAYOUT"] as const).map((k) => <option key={k} value={k}>{t.paymentKind[k]}</option>)}</Select>
        <Select aria-label="Durum" className="w-full sm:w-44" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}><option value="">Tüm durumlar</option>{(["PENDING", "SUCCEEDED", "FAILED"] as const).map((s) => <option key={s} value={s}>{t.paymentStatus[s]}</option>)}</Select>
      </div>
      <Card><CardContent>{query.isPending ? <Skeleton className="h-48" /> : query.data && query.data.items.length ? <PaymentHistory rows={query.data.items} role="ADMIN" /> : <p className="text-sm text-muted">Kayıt yok.</p>}</CardContent></Card>
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}
    </div>
  );
}

export function OutboxList() {
  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const dq = useDebounced(q);
  const query = useQuery({ ...trpc.admin.outbox.queryOptions({ page, pageSize: 15, q: dq || undefined }), placeholderData: (p) => p });
  return (
    <div className="grid gap-4">
      <Toolbar q={q} setQ={(v) => { setQ(v); setPage(1); }} />
      {query.isPending ? <Loading /> : !query.data?.items.length ? <EmptyState icon={Mail} title="Gönderilmiş e-posta yok" /> : (
        <Table head={["Konu", "Alıcı", "Tür", "Tarih"]}>
          {query.data.items.map((m) => (
            <tr key={m.id} className="hover:bg-surface-2"><td className="px-4 py-3"><Link href={`${routes.admin.outbox}/${m.id}`} className="font-semibold text-primary hover:underline">{m.subject}</Link></td><td className="px-4 py-3">{m.to}</td><td className="px-4 py-3"><Badge>{m.kind}</Badge></td><td className="px-4 py-3 text-muted">{formatDateTime(m.createdAt)}</td></tr>
          ))}
        </Table>
      )}
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}
    </div>
  );
}

export function OutboxItem({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.admin.outboxItem.queryOptions({ id }));
  if (isPending || !data) return <Loading />;
  return (
    <Card>
      <CardContent className="grid gap-4">
        <dl className="grid gap-1 text-sm"><div className="flex gap-2"><dt className="w-16 text-muted">Konu</dt><dd className="font-semibold">{data.subject}</dd></div><div className="flex gap-2"><dt className="w-16 text-muted">Alıcı</dt><dd>{data.toName ? `${data.toName} <${data.to}>` : data.to}</dd></div><div className="flex gap-2"><dt className="w-16 text-muted">Tarih</dt><dd>{formatDateTime(data.createdAt)}</dd></div></dl>
        <iframe title="E-posta önizleme" sandbox="" srcDoc={data.html} className="h-[28rem] w-full rounded-xl border border-border bg-white" />
        <details className="text-sm"><summary className="cursor-pointer text-muted">Düz metin</summary><pre className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-xs">{data.text}</pre></details>
      </CardContent>
    </Card>
  );
}

export function MessagesAdmin() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const query = useQuery({ ...trpc.content.messages.queryOptions({ page, pageSize: 10 }), placeholderData: (p) => p });
  const mark = useMutation(trpc.content.messageHandled.mutationOptions({ onSuccess: () => { void qc.invalidateQueries({ queryKey: trpc.content.pathKey() }); void qc.invalidateQueries({ queryKey: trpc.dashboard.pathKey() }); } }));
  return (
    <div className="grid gap-3">
      {query.isPending ? <Loading /> : !query.data?.items.length ? <EmptyState icon={Mail} title="Mesaj yok" /> : query.data.items.map((m) => (
        <Card key={m.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-semibold">{m.subject}</p><p className="text-xs text-muted">{m.name} · {m.email} · {formatDateTime(m.createdAt)}</p></div>
            <Button size="sm" variant={m.handled ? "outline" : "primary"} onClick={() => mark.mutate({ id: m.id, handled: !m.handled })}>{m.handled ? "Açık olarak işaretle" : "İşlendi"}</Button>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{m.message}</p>
        </Card>
      ))}
      {query.data ? <Pager page={query.data.page} pageCount={query.data.pageCount} total={query.data.total} onPage={setPage} /> : null}
    </div>
  );
}

export function FaqAdmin() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const list = useQuery(trpc.content.faqAll.queryOptions());
  const [edit, setEdit] = useState<{ id?: number; question: string; answer: string; position: number; active: boolean } | null>(null);
  const refresh = () => { void qc.invalidateQueries({ queryKey: trpc.content.pathKey() }); setEdit(null); };
  const save = useMutation(trpc.content.faqSave.mutationOptions({ onSuccess: () => { notifySuccess("Kaydedildi"); refresh(); }, onError: (e) => notifyError(errorMessage(e)) }));
  const del = useMutation(trpc.content.faqDelete.mutationOptions({ onSuccess: refresh }));
  return (
    <div className="grid gap-4">
      <div><Button onClick={() => setEdit({ question: "", answer: "", position: (list.data?.length ?? 0), active: true })}><Plus /> Yeni soru</Button></div>
      {edit ? (
        <Card><CardContent className="grid gap-4">
          <Field label="Soru" htmlFor="faq-q"><Input id="faq-q" value={edit.question} onChange={(e) => setEdit({ ...edit, question: e.target.value })} /></Field>
          <Field label="Cevap" htmlFor="faq-a"><Textarea id="faq-a" value={edit.answer} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} /></Field>
          <div className="flex flex-wrap items-center gap-3">
            <Field label="Sıra" htmlFor="faq-p" className="w-24"><Input id="faq-p" type="number" value={edit.position} onChange={(e) => setEdit({ ...edit, position: Number(e.target.value) })} /></Field>
            <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Yayında</label>
            <div className="ml-auto mt-6 flex gap-2"><Button variant="outline" onClick={() => setEdit(null)}>Vazgeç</Button><Button disabled={save.isPending} onClick={() => save.mutate(edit)}>Kaydet</Button></div>
          </div>
        </CardContent></Card>
      ) : null}
      {list.isPending ? <Loading /> : list.data?.map((f) => (
        <Card key={f.id} className="flex flex-wrap items-start gap-3 p-4">
          <div className="min-w-0 flex-1"><p className="font-semibold">{f.question} {!f.active ? <Badge className="ml-1">Taslak</Badge> : null}</p><p className="mt-1 line-clamp-2 text-sm text-muted">{f.answer}</p></div>
          <Button size="sm" variant="outline" onClick={() => setEdit(f)}>Düzenle</Button>
          <Button size="sm" variant="outline" aria-label="Sil" onClick={() => del.mutate({ id: f.id })}><Trash2 /></Button>
        </Card>
      ))}
    </div>
  );
}

export { LinkStatusBadge };
