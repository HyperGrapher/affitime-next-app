import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/account/components/password-forms";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Şifrenizi mi unuttunuz?</h1>
      <p className="mt-2 text-muted">E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.</p>
      <ForgotPasswordForm />
    </>
  );
}
