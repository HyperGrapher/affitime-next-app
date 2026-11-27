import { MailWarning } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ResendVerification } from "@/features/account/components/resend-verification";
import { demoVerify } from "@/features/account/verify-action";
import { getViewer } from "@/server/session";
import { SignOutButton } from "@/features/account/components/sign-out-button";
import { env } from "@/env";
import { homeForRole, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "E-postanızı doğrulayın" };

export default async function NotVerifiedPage() {
  const viewer = await getViewer();
  if (!viewer) redirect(routes.signin);
  if (viewer.emailVerified) redirect(homeForRole(viewer.role));
  return (
    <div className="text-center">
      <MailWarning className="mx-auto size-14 text-warning" />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">E-postanızı doğrulayın</h1>
      <p className="mt-2 text-muted"><b>{viewer.email}</b> adresine bir doğrulama bağlantısı gönderdik. Devam etmek için bağlantıya tıklayın.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ResendVerification email={viewer.email} />
        <SignOutButton />
      </div>
      {env.DEMO_MODE ? (
        <form action={demoVerify} className="mt-8 rounded-2xl border border-dashed border-accent/60 bg-accent-soft/50 p-4 text-sm">
          <p className="mb-3 text-muted">Demo modu: e-postalar gerçekten gönderilmez, <b>Admin → Outbox</b> sayfasında görünür.</p>
          <Button type="submit" variant="accent">Demo: e-postayı doğrula</Button>
        </form>
      ) : null}
    </div>
  );
}
