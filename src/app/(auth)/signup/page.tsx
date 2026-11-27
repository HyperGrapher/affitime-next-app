import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/features/account/components/signup-form";
import { getViewer } from "@/server/session";
import { homeForRole, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Kayıt ol" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const viewer = await getViewer();
  if (viewer) redirect(homeForRole(viewer.role));
  const { role } = await searchParams;
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Hesabınızı oluşturun</h1>
      <p className="mt-2 text-muted">Marka olarak 14 gün ücretsiz deneyin ya da partner olarak kazanmaya başlayın.</p>
      <SignUpForm initialRole={role === "vendor" ? "VENDOR" : "PARTNER"} />
      <p className="mt-6 text-center text-sm text-muted">Zaten hesabınız var mı? <Link href={routes.signin} className="font-semibold text-primary hover:underline">Giriş yapın</Link></p>
    </>
  );
}
