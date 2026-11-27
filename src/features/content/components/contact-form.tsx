"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { errorMessage, notifyError } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { contactInput } from "../schemas";
import type { z } from "zod";

type Values = z.infer<typeof contactInput>;

export function ContactForm() {
  const trpc = useTRPC();
  const send = useMutation(trpc.content.submitContact.mutationOptions({ onError: (e) => notifyError(errorMessage(e)) }));
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(contactInput) });
  if (send.isSuccess) return <Card className="grid place-items-center p-10 text-center"><CheckCircle2 className="size-12 text-success" /><h2 className="mt-3 text-xl font-bold">Mesajınız alındı</h2><p className="mt-1 text-sm text-muted">Size en kısa sürede dönüş yapacağız.</p></Card>;
  return (
    <Card className="p-6">
      <form noValidate onSubmit={handleSubmit((v) => send.mutate(v))} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Adınız" htmlFor="name" error={errors.name?.message}><Input id="name" autoComplete="name" {...register("name")} /></Field>
          <Field label="E-posta" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} /></Field>
        </div>
        <Field label="Konu" htmlFor="subject" error={errors.subject?.message}><Input id="subject" {...register("subject")} /></Field>
        <Field label="Mesaj" htmlFor="message" error={errors.message?.message}><Textarea id="message" className="min-h-36" {...register("message")} /></Field>
        <div aria-hidden className="absolute -left-[9999px]"><label>Website<input tabIndex={-1} autoComplete="off" {...register("website")} /></label></div>
        <Button type="submit" size="lg" disabled={send.isPending}>{send.isPending ? "Gönderiliyor…" : "Gönder"}</Button>
      </form>
    </Card>
  );
}
