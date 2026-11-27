"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import { clickEarning } from "@/domain/commission";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { errorMessage, notifyError, notifySuccess } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { t } from "@/i18n";
import type { z } from "zod";
import { productInput, type ProductInput } from "../schemas";

type ProductFormValues = z.input<typeof productInput>;

const DEFAULTS: ProductInput = { title: "", summary: "", description: "", productUrl: "", image: null, categoryId: 0, tags: [], price: 0, cookieDays: 30, clickCommission: 1, clickCommissionType: "CASH", saleCommission: 5, saleCommissionType: "PERCENT" };

export function ProductForm({ id, initial }: { id?: string; initial?: ProductInput }) {
  const trpc = useTRPC();
  const router = useRouter();
  const qc = useQueryClient();
  const categories = useQuery(trpc.catalog.categories.queryOptions());
  const { register, control, handleSubmit, formState: { errors } } = useForm<ProductFormValues, unknown, ProductInput>({ resolver: zodResolver(productInput), defaultValues: initial ?? DEFAULTS });
  const done = (msg: string) => { notifySuccess(msg); void qc.invalidateQueries({ queryKey: trpc.products.pathKey() }); router.push(routes.vendor.products); router.refresh(); };
  const create = useMutation(trpc.products.create.mutationOptions({ onSuccess: () => done("Ürün oluşturuldu"), onError: (e) => notifyError(errorMessage(e)) }));
  const update = useMutation(trpc.products.update.mutationOptions({ onSuccess: () => done("Ürün güncellendi"), onError: (e) => notifyError(errorMessage(e)) }));
  const pending = create.isPending || update.isPending;
  const v = useWatch({ control }) as ProductFormValues;
  const earning = clickEarning({ clickCommission: Number(v.clickCommission) || 0, clickCommissionType: v.clickCommissionType, productPrice: Number(v.price) || 0 });

  return (
    <form noValidate onSubmit={handleSubmit((values) => (id ? update.mutate({ ...values, id }) : create.mutate(values)))} className="grid gap-6 lg:grid-cols-3">
      <div className="grid gap-6 lg:col-span-2">
        <Card>
          <CardHeader><div><CardTitle>Ürün bilgileri</CardTitle><CardDescription>Partnerler pazaryerinde bu bilgileri görür.</CardDescription></div></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Başlık" htmlFor="title" error={errors.title?.message}><Input id="title" {...register("title")} /></Field>
            <Field label="Kısa açıklama" htmlFor="summary" error={errors.summary?.message} hint="Kartlarda gösterilir (280 karakter)"><Textarea id="summary" className="min-h-20" {...register("summary")} /></Field>
            <Field label="Detaylı açıklama" htmlFor="description" error={errors.description?.message}><Textarea id="description" className="min-h-32" {...register("description")} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori" htmlFor="categoryId" error={errors.categoryId?.message}>
                <Select id="categoryId" {...register("categoryId", { valueAsNumber: true })}><option value={0}>Seçin…</option>{categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
              </Field>
              <Controller control={control} name="tags" render={({ field }) => (
                <Field label="Etiketler" htmlFor="tags" hint="Virgülle ayırın">
                  <Input id="tags" value={(field.value ?? []).join(", ")} onChange={(e) => field.onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                </Field>
              )} />
            </div>
            <Field label="Ürün sayfası URL" htmlFor="productUrl" error={errors.productUrl?.message} hint="Partner tıklamaları bu adrese yönlendirilir"><Input id="productUrl" type="url" inputMode="url" placeholder="https://" {...register("productUrl")} /></Field>
            <Controller control={control} name="image" render={({ field }) => (<div className="grid gap-1.5"><span className="text-sm font-medium">Görsel</span><ImageUpload kind="product" value={field.value} onChange={field.onChange} name={v.title} /></div>)} />
          </CardContent>
        </Card>
      </div>
      <div className="grid content-start gap-6">
        <Card>
          <CardHeader><CardTitle>Fiyat ve komisyon</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Ürün fiyatı (₺)" htmlFor="price" error={errors.price?.message}><Input id="price" type="number" step="0.01" inputMode="decimal" {...register("price", { valueAsNumber: true })} /></Field>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Field label="Tıklama komisyonu" htmlFor="clickCommission" error={errors.clickCommission?.message}><Input id="clickCommission" type="number" step="0.01" {...register("clickCommission", { valueAsNumber: true })} /></Field>
              <Field label="Tür" htmlFor="clickCommissionType"><Select id="clickCommissionType" className="w-28" {...register("clickCommissionType")}><option value="CASH">₺</option><option value="PERCENT">%</option></Select></Field>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Field label="Satış komisyonu" htmlFor="saleCommission" error={errors.saleCommission?.message}><Input id="saleCommission" type="number" step="0.01" {...register("saleCommission", { valueAsNumber: true })} /></Field>
              <Field label="Tür" htmlFor="saleCommissionType"><Select id="saleCommissionType" className="w-28" {...register("saleCommissionType")}><option value="CASH">₺</option><option value="PERCENT">%</option></Select></Field>
            </div>
            <Field label="Çerez süresi (gün)" htmlFor="cookieDays" error={errors.cookieDays?.message}><Input id="cookieDays" type="number" {...register("cookieDays", { valueAsNumber: true })} /></Field>
            <p className="rounded-lg bg-primary-soft px-3 py-2 text-sm text-primary">Her geçerli tıklama partnere <b>{formatMoney(earning)}</b> kazandırır ({t.commission[v.clickCommissionType]}).</p>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="submit" size="lg" className="flex-1" disabled={pending}>{pending ? "Kaydediliyor…" : id ? "Değişiklikleri kaydet" : "Ürünü yayınla"}</Button>
          <ButtonLink href={routes.vendor.products} variant="outline" size="lg">Vazgeç</ButtonLink>
        </div>
      </div>
    </form>
  );
}
