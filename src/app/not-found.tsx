import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Logo className="mb-10" />
        <p className="font-display text-8xl font-extrabold tracking-tight text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold">Sayfa bulunamadı</h1>
        <p className="mt-2 text-muted">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>
        <ButtonLink href="/" className="mt-8">Ana sayfaya dön</ButtonLink>
      </div>
    </main>
  );
}
