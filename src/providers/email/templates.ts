import type { EmailKind } from "@/generated/prisma/client";
import { env } from "@/env";

export interface TemplateVars {
  name?: string;
  url?: string;
  brand?: string;
  partner?: string;
  product?: string;
  plan?: string;
  amount?: string;
  date?: string;
  [key: string]: string | undefined;
}

interface Rendered {
  subject: string;
  lines: string[];
  cta?: { label: string; urlKey: "url" };
}

const T: Record<EmailKind, (v: TemplateVars) => Rendered> = {
  VERIFY_EMAIL: (v) => ({ subject: "E-posta adresinizi doğrulayın", lines: [`Merhaba ${v.name ?? ""},`, "Affitime hesabınızı etkinleştirmek için e-posta adresinizi doğrulayın."], cta: { label: "E-postamı doğrula", urlKey: "url" } }),
  RESET_PASSWORD: (v) => ({ subject: "Şifre sıfırlama isteği", lines: [`Merhaba ${v.name ?? ""},`, "Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın. İsteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz."], cta: { label: "Şifremi sıfırla", urlKey: "url" } }),
  CHANGE_EMAIL: (v) => ({ subject: "E-posta değişikliğini onaylayın", lines: [`Merhaba ${v.name ?? ""},`, `E-posta adresinizi ${v.newEmail ?? ""} olarak değiştirme isteğini onaylayın.`], cta: { label: "Değişikliği onayla", urlKey: "url" } }),
  LINK_REQUESTED: (v) => ({ subject: "Yeni kampanya başvurusu!", lines: [`Merhaba ${v.brand ?? ""},`, `${v.partner ?? "Bir partner"}, "${v.product ?? ""}" ürününüz için link talep etti.`], cta: { label: "Başvuruyu incele", urlKey: "url" } }),
  LINK_APPROVED: (v) => ({ subject: "Kampanya başvurusu kabul edildi!", lines: [`Merhaba ${v.partner ?? ""},`, `${v.brand ?? ""} markasının "${v.product ?? ""}" kampanyasına başvurunuz kabul edildi. Linkinizi paylaşmaya başlayabilirsiniz.`], cta: { label: "Linkime git", urlKey: "url" } }),
  LINK_DENIED: (v) => ({ subject: "Kampanya başvurusu reddedildi", lines: [`Merhaba ${v.partner ?? ""},`, `${v.brand ?? ""} markasının "${v.product ?? ""}" kampanyasına başvurunuz maalesef reddedildi.`] }),
  TRIAL_ENDING_SOON: (v) => ({ subject: "Deneme süreniz bitmek üzere", lines: [`Merhaba ${v.brand ?? ""},`, `Deneme süreniz ${v.date ?? ""} tarihinde sona eriyor. Kesintisiz devam etmek için bir plan seçin.`], cta: { label: "Planları gör", urlKey: "url" } }),
  TRIAL_ENDED: (v) => ({ subject: "Deneme süreniz bitti", lines: [`Merhaba ${v.brand ?? ""},`, "Deneme süreniz sona erdi; partner linkleriniz geçici olarak durduruldu. Bir plan satın alarak yeniden başlatın."], cta: { label: "Plan satın al", urlKey: "url" } }),
  PLAN_ENDING_SOON: (v) => ({ subject: "Planınız bitmek üzere", lines: [`Merhaba ${v.brand ?? ""},`, `${v.plan ?? ""} planınız ${v.date ?? ""} tarihinde sona eriyor.`], cta: { label: "Planı yenile", urlKey: "url" } }),
  PLAN_ENDED: (v) => ({ subject: "Planınız sona erdi", lines: [`Merhaba ${v.brand ?? ""},`, "Planınız sona erdi; partner linkleriniz geçici olarak durduruldu."], cta: { label: "Planı yenile", urlKey: "url" } }),
  CAMPAIGN_ENDED: (v) => ({ subject: "Kampanyanızın süresi bitti", lines: [`Merhaba ${v.brand ?? ""},`, `"${v.product ?? ""}" ürününüzün pazaryeri kampanyası sona erdi.`] }),
  PAYMENT_RECEIPT: (v) => ({ subject: "Ödemeniz alındı", lines: [`Merhaba ${v.name ?? ""},`, `${v.description ?? "Ödemeniz"} için ${v.amount ?? ""} tutarındaki ödemeniz başarıyla alındı.`] }),
  PAYOUT_RECEIVED: (v) => ({ subject: "Komisyon ödemeniz yapıldı", lines: [`Merhaba ${v.partner ?? ""},`, `${v.brand ?? ""} markası size ${v.amount ?? ""} tutarında komisyon ödemesi yaptı.`], cta: { label: "Ödemelerim", urlKey: "url" } }),
  CONTACT_RECEIPT: (v) => ({ subject: "Mesajınızı aldık", lines: [`Merhaba ${v.name ?? ""},`, "Mesajınız bize ulaştı, en kısa sürede dönüş yapacağız."] }),
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function renderEmail(kind: EmailKind, vars: TemplateVars): { subject: string; html: string; text: string } {
  const r = T[kind](vars);
  const url = vars.url ? (vars.url.startsWith("http") ? vars.url : `${env.NEXT_PUBLIC_APP_URL}${vars.url}`) : undefined;
  const body = r.lines.map((l) => `<p style="margin:0 0 14px;line-height:1.6">${esc(l)}</p>`).join("");
  const button =
    r.cta && url
      ? `<p style="margin:24px 0"><a href="${esc(url)}" style="background:#4f46e5;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600">${esc(r.cta.label)}</a></p><p style="font-size:12px;color:#6b7280;word-break:break-all">${esc(url)}</p>`
      : "";
  const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#f4f4f7;font-family:system-ui,Segoe UI,sans-serif;color:#18181b"><div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;padding:32px"><p style="font-weight:800;font-size:20px;margin:0 0 24px;color:#4f46e5">Affitime</p>${body}${button}<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px"><p style="font-size:12px;color:#9ca3af;margin:0">© ${new Date().getUTCFullYear()} Affitime</p></div></body></html>`;
  const text = [...r.lines, r.cta && url ? `${r.cta.label}: ${url}` : ""].filter(Boolean).join("\n\n");
  return { subject: r.subject, html, text };
}
