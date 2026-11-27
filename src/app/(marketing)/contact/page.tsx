import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/features/content/components/contact-form";

export const metadata: Metadata = { title: "İletişim" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="font-display text-h1 font-extrabold">Bize yazın</h1>
        <p className="mt-3 text-muted">Sorularınız, önerileriniz veya kurumsal talepleriniz için formu doldurun; en kısa sürede dönüş yapalım.</p>
        <ul className="mt-8 grid gap-4 text-sm">
          <li className="flex items-center gap-3"><Mail className="size-5 text-primary" /> destek@affitime.com</li>
          <li className="flex items-center gap-3"><MessageCircle className="size-5 text-primary" /> Hafta içi 09:00–18:00</li>
          <li className="flex items-center gap-3"><MapPin className="size-5 text-primary" /> İstanbul, Türkiye</li>
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}
