"use client";

import { ButtonLink } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { homeForRole, routes, type AppRole } from "@/lib/routes";
import { t } from "@/i18n";

/** Client island so marketing pages stay statically cacheable (no cookies read on the server). */
export function HeaderActions() {
  const { data } = authClient.useSession();
  const role = (data?.user as { role?: AppRole } | undefined)?.role;
  if (data && role) return <ButtonLink href={homeForRole(role)} size="sm">Panele git</ButtonLink>;
  return (
    <>
      <ButtonLink href={routes.signin} variant="ghost" size="sm" className="hidden sm:inline-flex">{t.nav.signIn}</ButtonLink>
      <ButtonLink href={routes.signup()} size="sm">{t.nav.signUp}</ButtonLink>
    </>
  );
}
