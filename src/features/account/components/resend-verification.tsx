"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { notifyError, notifySuccess } from "@/lib/toast";

export function ResendVerification({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button variant="outline" disabled={busy} onClick={async () => {
      setBusy(true);
      const { error } = await authClient.sendVerificationEmail({ email, callbackURL: routes.verified });
      setBusy(false);
      if (error) notifyError(error.status === 429 ? "Çok sık istek gönderdiniz, biraz bekleyin." : undefined);
      else notifySuccess("Doğrulama e-postası yeniden gönderildi.");
    }}>
      Tekrar gönder
    </Button>
  );
}
