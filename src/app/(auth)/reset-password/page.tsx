import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/account/components/password-forms";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Şifre sıfırla" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  if (!token || error) {
    return (
      <>
        <h1 className="font-display text-3xl font-bold tracking-tight">Bağlantı geçersiz</h1>
        <p className="mt-2 text-muted">Sıfırlama bağlantısı geçersiz veya süresi dolmuş.</p>
        <Link href={routes.forgotPassword} className="mt-6 font-semibold text-primary hover:underline">Yeni bağlantı iste</Link>
      </>
    );
  }
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Yeni şifre belirleyin</h1>
      <ResetPasswordForm token={token} />
    </>
  );
}
