// Turkish is the default (and currently only) locale. To add English: create `en.ts` with the same shape and register it in `index.ts`.
export const tr = {
  brand: "Affitime",
  common: {
    save: "Kaydet", cancel: "Vazgeç", delete: "Sil", edit: "Düzenle", back: "Geri", next: "İleri", search: "Ara", loading: "Yükleniyor…", all: "Tümü",
    confirm: "Onayla", close: "Kapat", yes: "Evet", no: "Hayır", view: "Görüntüle", saved: "Kaydedildi", error: "Bir şeyler ters gitti", retry: "Tekrar dene",
    noResults: "Sonuç bulunamadı", page: "Sayfa", of: "/", prev: "Önceki", clicks: "Tıklama", earnings: "Kazanç", status: "Durum", actions: "İşlemler", created: "Oluşturulma",
  },
  nav: {
    dashboard: "Panel", products: "Ürünler", marketplace: "Pazaryeri", links: "Linkler", payments: "Ödemeler", notifications: "Bildirimler", settings: "Ayarlar", storeApi: "Mağaza API",
    users: "Kullanıcılar", outbox: "Outbox", faq: "SSS", messages: "Mesajlar", billing: "Planım", signOut: "Çıkış yap", signIn: "Giriş yap", signUp: "Kayıt ol",
    pricing: "Fiyatlar", blog: "Blog", contact: "İletişim", howItWorks: "Nasıl çalışır", features: "Özellikler", openMenu: "Menüyü aç",
  },
  roles: { VENDOR: "Marka", PARTNER: "Partner", ADMIN: "Admin", MODERATOR: "Moderatör" },
  plan: {
    TRIAL: "Deneme", BASIC: "Basic", PRO: "Pro", ULTIMATE: "Ultimate",
    state: { TRIAL: "Deneme sürümü", PLAN: "Aktif plan", TRIAL_ENDED: "Deneme bitti", PLAN_ENDED: "Plan bitti" },
  },
  linkStatus: {
    AWAITING: "Onay bekliyor", CONFIRMED: "Aktif", REQUEST_DENIED: "Reddedildi", PAUSED_BY_VENDOR: "Marka duraklattı", CANCELED_BY_VENDOR: "Marka iptal etti",
    CANCELED_BY_PARTNER: "Partner iptal etti", CANCELED_BY_ADMIN: "Yönetici iptal etti", PRODUCT_ARCHIVED: "Ürün arşivlendi", PRODUCT_NOT_ACTIVE: "Marka planı pasif",
  },
  linkAction: { APPROVE: "Onayla", DENY: "Reddet", PAUSE: "Duraklat", RESUME: "Devam ettir", CANCEL: "İptal et", ARCHIVE_PRODUCT: "Ürünü arşivle", SUSPEND_PLAN: "Askıya al", RESTORE_PLAN: "Geri yükle" },
  paymentKind: { PLAN: "Plan", CAMPAIGN: "Kampanya", PAYOUT: "Komisyon ödemesi" },
  paymentStatus: { PENDING: "Bekliyor", SUCCEEDED: "Başarılı", FAILED: "Başarısız" },
  visitFlag: { BOT: "Bot", NO_USER_AGENT: "Tarayıcı yok", SELF_PARTNER: "Kendi tıklaması", SELF_VENDOR: "Marka tıklaması", STAFF: "Ekip", KNOWN_IP: "Bilinen IP" },
  commission: { CASH: "Sabit (₺)", PERCENT: "Yüzde (%)" },
  notification: {
    WELCOME: "Affitime'a hoş geldiniz, {name}!",
    LINK_REQUESTED: "{partner}, “{product}” için link talep etti.",
    LINK_APPROVED: "{brand}, “{product}” başvurunuzu onayladı.",
    LINK_DENIED: "{brand}, “{product}” başvurunuzu reddetti.",
    LINK_PAUSED: "{brand}, “{product}” linkinizi duraklattı.",
    LINK_RESUMED: "{brand}, “{product}” linkinizi yeniden başlattı.",
    LINK_CANCELED: "“{product}” linki iptal edildi.",
    PRODUCT_ARCHIVED: "“{product}” ürünü arşivlendi; linkiniz kapatıldı.",
    PAYOUT_SENT: "{partner} partnerine {amount} ödeme yapıldı.",
    PAYOUT_RECEIVED: "{brand} size {amount} komisyon ödedi.",
    PLAN_ACTIVATED: "{plan} planınız aktifleştirildi.",
    PLAN_ENDING_SOON: "Planınız yakında sona eriyor.",
    PLAN_ENDED: "Planınız sona erdi; linkleriniz durduruldu.",
    TRIAL_ENDING_SOON: "Deneme süreniz yakında bitiyor.",
    TRIAL_ENDED: "Deneme süreniz bitti; linkleriniz durduruldu.",
    CAMPAIGN_STARTED: "“{product}” kampanyası {days} gün için başladı.",
    CAMPAIGN_ENDED: "“{product}” kampanyası sona erdi.",
  },
} as const;

export type Messages = typeof tr;
