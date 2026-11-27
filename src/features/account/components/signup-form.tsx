"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { errorMessage } from "@/lib/toast";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { registerInput, type RegisterInput } from "../schemas";
import { TRPCClientError } from "@trpc/client";

export function SignUpForm({ initialRole }: { initialRole: "VENDOR" | "PARTNER" }) {
  const trpc = useTRPC();
  const router = useRouter();
  const [role, setRole] = useState<"VENDOR" | "PARTNER">(initialRole);
  const [formError, setFormError] = useState<string | null>(null);
  const registerMutation = useMutation(trpc.account.register.mutationOptions());
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerInput),
    defaultValues: { role: initialRole } as RegisterInput,
  });
  const e = errors as Record<string, { message?: string } | undefined>;

  function switchRole(next: "VENDOR" | "PARTNER") {
    setRole(next);
    reset({ role: next } as RegisterInput);
    setFormError(null);
  }

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(values);
      const { error } = await authClient.signIn.email({ email: values.email, password: values.password });
      if (error) throw new Error("signin");
      router.push(routes.notVerified);
      router.refresh();
    } catch (err) {
      const field = err instanceof TRPCClientError ? (err.data as { field?: string | null } | null)?.field : undefined;
      if (field) setError(field as keyof RegisterInput, { message: errorMessage(err) });
      else setFormError(errorMessage(err));
    }
  }

  return (
    <>
      <div role="tablist" aria-label="Hesap türü" className="mt-6 grid grid-cols-2 rounded-xl bg-surface-2 p-1">
        {(["PARTNER", "VENDOR"] as const).map((r) => (
          <button key={r} role="tab" type="button" aria-selected={role === r} onClick={() => switchRole(r)} className={cn("rounded-lg py-2 text-sm font-semibold transition", role === r ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground")}>
            {r === "PARTNER" ? "Partner (yayıncı)" : "Marka (satıcı)"}
          </button>
        ))}
      </div>
      <form key={role} onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4" noValidate>
        {role === "VENDOR" ? (
          <>
            <Field label="Marka / firma adı" htmlFor="brand" error={e.brand?.message}><Input id="brand" autoComplete="organization" aria-invalid={!!e.brand} {...register("brand")} /></Field>
            <Field label="Web sitesi" htmlFor="website" error={e.website?.message} hint="https://magazam.com"><Input id="website" type="url" inputMode="url" aria-invalid={!!e.website} {...register("website")} /></Field>
          </>
        ) : (
          <Field label="Kullanıcı adı" htmlFor="username" error={e.username?.message} hint="Herkese açık profilinizde görünür"><Input id="username" autoComplete="username" aria-invalid={!!e.username} {...register("username")} /></Field>
        )}
        <Field label="Telefon" htmlFor="phone" error={e.phone?.message}><Input id="phone" type="tel" autoComplete="tel" placeholder="+90 5xx xxx xx xx" aria-invalid={!!e.phone} {...register("phone")} /></Field>
        <Field label="E-posta" htmlFor="email" error={e.email?.message}><Input id="email" type="email" autoComplete="email" aria-invalid={!!e.email} {...register("email")} /></Field>
        <Field label="Şifre" htmlFor="password" error={e.password?.message} hint="En az 8 karakter"><Input id="password" type="password" autoComplete="new-password" aria-invalid={!!e.password} {...register("password")} /></Field>
        {formError ? <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{formError}</p> : null}
        <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Hesap oluşturuluyor…" : role === "VENDOR" ? "14 gün ücretsiz dene" : "Partner olarak katıl"}</Button>
        <p className="text-center text-xs text-muted">Kayıt olarak <a className="underline" href={routes.legal("terms")}>Kullanım Koşulları</a> ve <a className="underline" href={routes.legal("privacy")}>Gizlilik Politikası</a>&apos;nı kabul edersiniz.</p>
      </form>
    </>
  );
}
