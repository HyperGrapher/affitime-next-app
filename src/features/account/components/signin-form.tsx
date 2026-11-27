"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/lib/routes";

const schema = z.object({ email: z.email("Geçerli bir e-posta girin"), password: z.string().min(1, "Şifrenizi girin") });
type Values = z.infer<typeof schema>;

export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setError(null);
    const { error: err } = await authClient.signIn.email({ email: values.email, password: values.password });
    if (err) {
      setError(err.status === 429 ? "Çok fazla deneme yaptınız. Lütfen biraz bekleyin." : "E-posta veya şifre hatalı.");
      return;
    }
    router.push(next ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4" noValidate>
      <Field label="E-posta" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Şifre" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
      </Field>
      <div className="-mt-1 text-right"><Link href={routes.forgotPassword} className="text-sm font-medium text-primary hover:underline">Şifremi unuttum</Link></div>
      {error ? <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}
      <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Giriş yapılıyor…" : "Giriş yap"}</Button>
    </form>
  );
}
