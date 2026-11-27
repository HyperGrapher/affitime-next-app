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
import { notifySuccess } from "@/lib/toast";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({ resolver: zodResolver(z.object({ email: z.email("Geçerli bir e-posta girin") })) });
  if (sent) return <p role="status" className="mt-6 rounded-xl bg-success-soft p-4 text-sm font-medium text-success">Bu e-posta ile bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.</p>;
  return (
    <form className="mt-8 grid gap-4" noValidate onSubmit={handleSubmit(async ({ email }) => { await authClient.requestPasswordReset({ email, redirectTo: routes.resetPassword }); setSent(true); })}>
      <Field label="E-posta" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} /></Field>
      <Button type="submit" size="lg" disabled={isSubmitting}>Sıfırlama bağlantısı gönder</Button>
      <Link href={routes.signin} className="text-center text-sm font-medium text-primary hover:underline">Girişe dön</Link>
    </form>
  );
}

const resetSchema = z.object({ password: z.string().min(8, "En az 8 karakter"), password2: z.string() }).refine((v) => v.password === v.password2, { path: ["password2"], message: "Şifreler eşleşmiyor" });

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });
  return (
    <form className="mt-8 grid gap-4" noValidate onSubmit={handleSubmit(async ({ password }) => {
      const { error: err } = await authClient.resetPassword({ newPassword: password, token });
      if (err) return setError("Bağlantı geçersiz veya süresi dolmuş. Yeni bir sıfırlama isteyin.");
      notifySuccess("Şifreniz güncellendi. Giriş yapabilirsiniz.");
      router.push(routes.signin);
    })}>
      <Field label="Yeni şifre" htmlFor="password" error={errors.password?.message}><Input id="password" type="password" autoComplete="new-password" {...register("password")} /></Field>
      <Field label="Yeni şifre (tekrar)" htmlFor="password2" error={errors.password2?.message}><Input id="password2" type="password" autoComplete="new-password" {...register("password2")} /></Field>
      {error ? <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}
      <Button type="submit" size="lg" disabled={isSubmitting}>Şifreyi güncelle</Button>
    </form>
  );
}
