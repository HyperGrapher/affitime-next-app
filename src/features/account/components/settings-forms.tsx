"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import { formatIban, maskIban } from "@/domain/iban";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { ibanInput, vendorProfileInput, partnerProfileInput, onboardingInput, INTEREST_OPTIONS } from "../schemas";
import { cn } from "@/lib/utils";

export function VendorProfileForm() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.account.vendorSettings.queryOptions());
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<z.infer<typeof vendorProfileInput>>({ resolver: zodResolver(vendorProfileInput), defaultValues: { brand: data.brand, website: data.website, phone: data.phone ?? "", logo: data.logo } });
  const save = useMutation(trpc.account.updateVendor.mutationOptions({
    onSuccess: () => { notifySuccess("Profil güncellendi"); void qc.invalidateQueries(); },
    onError: (e) => { const field = e.data?.field as "brand" | "website" | null | undefined; if (field) setError(field, { message: e.message }); else notifyError(errorMessage(e)); },
  }));
  return (
    <Card>
      <CardHeader><div><CardTitle>Marka profili</CardTitle><CardDescription>Partnerlerin gördüğü bilgiler.</CardDescription></div></CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
          <Controller control={control} name="logo" render={({ field }) => <div className="sm:col-span-2"><ImageUpload kind="avatar" name={data.brand} value={field.value} onChange={field.onChange} /></div>} />
          <Field label="Marka adı" htmlFor="brand" error={errors.brand?.message}><Input id="brand" {...register("brand")} /></Field>
          <Field label="Web sitesi" htmlFor="website" error={errors.website?.message}><Input id="website" type="url" {...register("website")} /></Field>
          <Field label="Telefon" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" {...register("phone")} /></Field>
          <Field label="E-posta" htmlFor="email" hint="Değiştirmek için aşağıdaki bölümü kullanın"><Input id="email" value={data.email} readOnly disabled /></Field>
          <div className="sm:col-span-2"><Button type="submit" disabled={save.isPending}>Kaydet</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PartnerProfileForm() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.account.partnerSettings.queryOptions());
  const { register, control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof partnerProfileInput>>({ resolver: zodResolver(partnerProfileInput), defaultValues: { phone: data.phone ?? "", avatar: data.avatar } });
  const save = useMutation(trpc.account.updatePartner.mutationOptions({ onSuccess: () => { notifySuccess("Profil güncellendi"); void qc.invalidateQueries(); }, onError: (e) => notifyError(errorMessage(e)) }));
  return (
    <Card>
      <CardHeader><div><CardTitle>Profil</CardTitle><CardDescription>Kullanıcı adı: <b>{data.username}</b> · {data.email}</CardDescription></div></CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4">
          <Controller control={control} name="avatar" render={({ field }) => <ImageUpload kind="avatar" name={data.username} value={field.value} onChange={field.onChange} />} />
          <Field label="Telefon" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" {...register("phone")} /></Field>
          <div><Button type="submit" disabled={save.isPending}>Kaydet</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

export function IbanForm() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.account.partnerSettings.queryOptions());
  const { register, handleSubmit, setError, formState: { errors } } = useForm<z.infer<typeof ibanInput>>({ resolver: zodResolver(ibanInput), defaultValues: { ibanHolder: data.ibanHolder ?? "", iban: data.iban ? formatIban(data.iban) : "" } });
  const save = useMutation(trpc.account.saveIban.mutationOptions({
    onSuccess: () => { notifySuccess("IBAN kaydedildi"); void qc.invalidateQueries(); },
    onError: (e) => { if (e.message === "Geçersiz IBAN") setError("iban", { message: "Geçerli bir TR IBAN girin" }); else notifyError(errorMessage(e)); },
  }));
  return (
    <Card id="iban">
      <CardHeader><div><CardTitle>Ödeme bilgileri (IBAN)</CardTitle><CardDescription>Komisyonlar bu hesaba aktarılır. {data.iban ? `Kayıtlı: ${maskIban(data.iban)}` : "Henüz IBAN eklenmedi."}</CardDescription></div></CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
          <Field label="Hesap sahibi" htmlFor="ibanHolder" error={errors.ibanHolder?.message}><Input id="ibanHolder" autoComplete="name" {...register("ibanHolder")} /></Field>
          <Field label="IBAN" htmlFor="iban" error={errors.iban?.message}><Input id="iban" placeholder="TR00 0000 0000 0000 0000 0000 00" {...register("iban")} /></Field>
          <div className="sm:col-span-2"><Button type="submit" disabled={save.isPending}>IBAN'ı kaydet</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

const pwSchema = z.object({ currentPassword: z.string().min(1, "Mevcut şifrenizi girin"), newPassword: z.string().min(8, "En az 8 karakter") });
export function SecurityForms({ email }: { email: string }) {
  const [revoke] = useState(true);
  const pw = useForm<z.infer<typeof pwSchema>>({ resolver: zodResolver(pwSchema) });
  const em = useForm<{ newEmail: string }>({ resolver: zodResolver(z.object({ newEmail: z.email("Geçerli bir e-posta girin") })) });
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><div><CardTitle>Şifre değiştir</CardTitle></div></CardHeader>
        <CardContent>
          <form noValidate className="grid gap-4 sm:grid-cols-2" onSubmit={pw.handleSubmit(async (v) => {
            const { error } = await authClient.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword, revokeOtherSessions: revoke });
            if (error) pw.setError("currentPassword", { message: "Mevcut şifre hatalı" }); else { notifySuccess("Şifreniz güncellendi"); pw.reset(); }
          })}>
            <Field label="Mevcut şifre" htmlFor="currentPassword" error={pw.formState.errors.currentPassword?.message}><Input id="currentPassword" type="password" autoComplete="current-password" {...pw.register("currentPassword")} /></Field>
            <Field label="Yeni şifre" htmlFor="newPassword" error={pw.formState.errors.newPassword?.message}><Input id="newPassword" type="password" autoComplete="new-password" {...pw.register("newPassword")} /></Field>
            <div className="sm:col-span-2"><Button type="submit" disabled={pw.formState.isSubmitting}>Şifreyi güncelle</Button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div><CardTitle>E-posta değiştir</CardTitle><CardDescription>Mevcut: {email}. Onay bağlantısı e-posta adresinize gönderilir.</CardDescription></div></CardHeader>
        <CardContent>
          <form noValidate className="flex flex-wrap items-end gap-3" onSubmit={em.handleSubmit(async (v) => {
            const { error } = await authClient.changeEmail({ newEmail: v.newEmail, callbackURL: routes.changeEmail });
            if (error) notifyError(error.message); else { notifySuccess("Onay bağlantısı gönderildi"); em.reset(); }
          })}>
            <Field label="Yeni e-posta" htmlFor="newEmail" error={em.formState.errors.newEmail?.message} className="min-w-64 flex-1"><Input id="newEmail" type="email" {...em.register("newEmail")} /></Field>
            <Button type="submit" disabled={em.formState.isSubmitting}>Onay iste</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const SOCIALS = ["instagram", "youtube", "tiktok", "x", "blog", "other"] as const;
export function OnboardingForm({ mode }: { mode: "wizard" | "settings" }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.account.partnerSettings.queryOptions());
  const [interests, setInterests] = useState<string[]>(data.interests);
  const [socials, setSocials] = useState<Record<string, string>>(Object.fromEntries(data.socials.map((s) => [s.platform, s.handle])));
  const save = useMutation(trpc.account.saveOnboarding.mutationOptions({ onSuccess: () => { notifySuccess("Tercihleriniz kaydedildi"); void qc.invalidateQueries(); if (mode === "wizard") window.location.assign(routes.partner.dashboard); }, onError: (e) => notifyError(errorMessage(e)) }));
  const skip = useMutation(trpc.account.skipOnboarding.mutationOptions({ onSuccess: () => window.location.assign(routes.partner.dashboard) }));
  const submit = () => {
    const parsed = onboardingInput.safeParse({ interests, socials: Object.entries(socials).filter(([, h]) => h.trim()).map(([platform, handle]) => ({ platform, handle })) });
    if (!parsed.success) return notifyError("Lütfen sosyal medya alanlarını kontrol edin.");
    save.mutate(parsed.data);
  };
  return (
    <Card>
      <CardHeader><div><CardTitle>İlgi alanları ve sosyal hesaplar</CardTitle><CardDescription>Size uygun kampanyaları önermemize ve markaların sizi tanımasına yardımcı olur.</CardDescription></div></CardHeader>
      <CardContent className="grid gap-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">İlgi alanları</legend>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((o) => {
              const on = interests.includes(o);
              return <button key={o} type="button" aria-pressed={on} onClick={() => setInterests(on ? interests.filter((i) => i !== o) : [...interests, o])} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition", on ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-muted")}>{o}</button>;
            })}
          </div>
        </fieldset>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-medium">Sosyal hesaplar</legend>
          {SOCIALS.map((s) => <Field key={s} label={{ instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", x: "X (Twitter)", blog: "Blog / web sitesi", other: "Diğer" }[s]} htmlFor={`soc-${s}`}><Input id={`soc-${s}`} value={socials[s] ?? ""} onChange={(e) => setSocials({ ...socials, [s]: e.target.value })} placeholder={s === "blog" ? "site.com" : "@kullaniciadi"} /></Field>)}
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Button onClick={submit} disabled={save.isPending}>{mode === "wizard" ? "Kaydet ve devam et" : "Kaydet"}</Button>
          {mode === "wizard" ? <Button variant="ghost" onClick={() => skip.mutate()}>Şimdilik atla</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}
