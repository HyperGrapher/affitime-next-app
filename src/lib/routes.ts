// Single source of truth for URLs.
export const routes = {
  home: "/",
  pricing: "/pricing",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  faq: "/#faq",
  contact: "/contact",
  legal: (doc: string) => `/legal/${doc}`,
  signin: "/signin",
  signup: (role?: "vendor" | "partner") => (role ? `/signup?role=${role}` : "/signup"),
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verified: "/verified",
  notVerified: "/not-verified",
  changeEmail: "/change-email",
  product: (id: string) => `/products/${id}`,
  tracking: (code: string) => `/r/${code}`,
  unavailable: (reason: string) => `/r/unavailable?reason=${reason}`,
  billing: {
    plans: "/billing/plans",
    checkout: (ref: string) => `/billing/checkout/${ref}`,
    result: (ref: string) => `/billing/result/${ref}`,
    paymentRequired: "/billing/payment-required",
  },
  vendor: {
    dashboard: "/vendor/dashboard",
    products: "/vendor/products",
    newProduct: "/vendor/products/new",
    product: (id: string) => `/vendor/products/${id}`,
    links: "/vendor/links",
    link: (id: string) => `/vendor/links/${id}`,
    payments: "/vendor/payments",
    payPartner: (partnerId: string) => `/vendor/payments/${partnerId}`,
    notifications: "/vendor/notifications",
    storeApi: "/vendor/store-api",
    settings: "/vendor/settings",
  },
  partner: {
    dashboard: "/partner/dashboard",
    onboarding: "/partner/onboarding",
    products: "/partner/products",
    links: "/partner/links",
    link: (id: string) => `/partner/links/${id}`,
    payments: "/partner/payments",
    notifications: "/partner/notifications",
    settings: "/partner/settings",
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    products: "/admin/products",
    links: "/admin/links",
    payments: "/admin/payments",
    outbox: "/admin/outbox",
    faq: "/admin/faq",
    messages: "/admin/messages",
  },
} as const;

export type AppRole = "VENDOR" | "PARTNER" | "ADMIN" | "MODERATOR";

export function homeForRole(role: AppRole): string {
  switch (role) {
    case "VENDOR":
      return routes.vendor.dashboard;
    case "PARTNER":
      return routes.partner.dashboard;
    default:
      return routes.admin.dashboard;
  }
}
