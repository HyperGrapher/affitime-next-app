export const DRAWER_WIDTH = 240 as const;
export const COOKIE_SIGN_KEY = "affi:cookie:signatureKey:keygrip" as const;
export const USER_IP_SESSION_STORAGE = "atuiss" as const;
export const PAYTR_PLAN_PAYMENT_URL = "https://www.paytr.com/odeme" as const;
export const PAYTR_MARKETPLACE_URL = "https://www.paytr.com/odeme/platform/transfer" as const;
export const AVATAR_URL = "https://affiti.me/img/avatar" as const;

export const PAYTR = {
  merchant_id: 320089,
  merchant_key: "w978DHbrEGdA9RsS",
  merchant_salt: "7AuBqZA6iNQSabnJ",
};

export const PAYTR_MARKETPLACE = {
  merchant_id: 339896,
  merchant_key: "bfqaRWT9ZGMw3HC4",
  merchant_salt: "ejRTNLhidiGwJn53",
};

export const POLL_CATEGORIES = {
  cat1: "Elektronik",
  cat2: "Giyim & Aksesuar",
  cat3: "Müzik Aletleri",
  cat4: "Cep Telefonu",
  cat5: "Elektrikli Ev Aletleri",
  cat6: "Anne & Bebek",
  cat7: "Hobi & Oyuncak",
  cat8: "Kişisel Bakım & Kozmetik",
  cat9: "Oyun & Konsol",
  cat10: "Takı, Mücevher & Altın",
};



export interface IAppPaymentRequiredType {
  NONE: string;
  END_OF_TRIAL: string;
  END_OF_PLAN: string;
  UNKNOWN: string;
}

export const appPaymentRequiredTypes = {
  NONE: "none",
  END_OF_TRIAL: "end_of_trial",
  END_OF_PLAN: "end_of_plan",
  UNKNOWN: "unknown",
} as const;

export interface IUserPlanCheck {
  type: IAppPaymentRequiredType;
  paymentRequired: boolean;
  packageType: string;
}

