import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/features/account/components/signin-form";
import { DemoLogin } from "@/features/account/components/demo-login";
import { getViewer } from "@/server/session";
import { env } from "@/env";
import { homeForRole, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Giriş yap" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const viewer = await getViewer();
  if (viewer) redirect(homeForRole(viewer.role));
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Tekrar hoş geldiniz</h1>
      <p className="mt-2 text-muted">Hesabınıza giriş yapın.</p>
      <SignInForm next={safeNext} />
      <p className="mt-6 text-center text-sm text-muted">Hesabınız yok mu? <Link href={routes.signup()} className="font-semibold text-primary hover:underline">Kayıt olun</Link></p>
      {env.DEMO_MODE ? <DemoLogin /> : null}
    </>
  );
}
