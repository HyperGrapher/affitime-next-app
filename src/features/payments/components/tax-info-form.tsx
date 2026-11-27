"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { taxInfoInput, type TaxInfoInput } from "../schemas";

export function TaxInfoForm({ onSaved }: { onSaved?: () => void }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.payments.taxInfo.queryOptions());
  const save = useMutation(trpc.payments.saveTaxInfo.mutationOptions({
    onSuccess: () => { notifySuccess("Fatura bilgileri kaydedildi"); void qc.invalidateQueries({ queryKey: trpc.payments.taxInfo.queryKey() }); onSaved?.(); },
    onError: (e) => notifyError(errorMessage(e)),
  }));
  const { register, handleSubmit, formState: { errors } } = useForm<TaxInfoInput>({
    resolver: zodResolver(taxInfoInput),
    defaultValues: { title: data?.title ?? "", firstName: data?.firstName ?? "", lastName: data?.lastName ?? "", tckn: data?.tckn ?? "", vkn: data?.vkn ?? "", taxOffice: data?.taxOffice ?? "", address: data?.address ?? "", city: data?.city ?? "" },
  });
  return (
    <Card>
      <CardHeader><div><CardTitle>Fatura bilgileri</CardTitle><CardDescription>Plan ve kampanya ödemelerinde fatura bu bilgilerle kesilir.</CardDescription></div></CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2">
          <Field label="Unvan" htmlFor="title" className="sm:col-span-2"><Input id="title" {...register("title")} /></Field>
          <Field label="Ad" htmlFor="firstName" error={errors.firstName?.message}><Input id="firstName" autoComplete="given-name" {...register("firstName")} /></Field>
          <Field label="Soyad" htmlFor="lastName" error={errors.lastName?.message}><Input id="lastName" autoComplete="family-name" {...register("lastName")} /></Field>
          <Field label="Vergi no (VKN)" htmlFor="vkn" error={errors.vkn?.message}><Input id="vkn" inputMode="numeric" {...register("vkn")} /></Field>
          <Field label="TC kimlik no" htmlFor="tckn" error={errors.tckn?.message}><Input id="tckn" inputMode="numeric" {...register("tckn")} /></Field>
          <Field label="Vergi dairesi" htmlFor="taxOffice"><Input id="taxOffice" {...register("taxOffice")} /></Field>
          <Field label="Şehir" htmlFor="city"><Input id="city" autoComplete="address-level1" {...register("city")} /></Field>
          <Field label="Adres" htmlFor="address" error={errors.address?.message} className="sm:col-span-2"><Textarea id="address" autoComplete="street-address" {...register("address")} /></Field>
          <div className="sm:col-span-2"><Button type="submit" disabled={save.isPending}>{save.isPending ? "Kaydediliyor…" : "Kaydet"}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
