export interface ICreditCard {
  id: number;
  name: string
}


export type PlanTypes =
  | "NONE"
  | "TRIAL"
  | "FREE"
  | "BASIC"
  | "PRO"
  | "ULTIMATE"
  | "OTHER";

export interface IPlanPaymentData {
  merchant_id: number;
  paytr_token: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_type: string;
  payment_amount: number | string; // double
  installment_count: number | string;
  non_3d: number;
  non3d_test_failed?: number;
  test_mode?: number;
  card_type?: string;
  currency?: string;
  client_lang?: string;
  cc_owner?: string;
  card_number?: string;
  expiry_month?: string;
  expiry_year?: string;
  cvv?: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  user_name: string;
  user_address: string;
  user_phone: string;
  user_basket: string;
  debug_on?: number; // 0,1
  sync_mode?: number; // 0,1
}


export interface InstallmentType {
  status:           string;
  request_id:       string;
  max_inst_non_bus: string;
  oranlar:          Oranlar;
}

export interface Oranlar {
  world:      { [key: string]: number };
  axess:      { [key: string]: number };
  maximum:    { [key: string]: number };
  cardfinans: { [key: string]: number };
  paraf:      { [key: string]: number };
  advantage:  { [key: string]: number };
  combo:      { [key: string]: number };
  bonus:      { [key: string]: number };
  saglamkart: { [key: string]: number };
  tumu:       Tumu;
}

export interface Tumu {
  tek_cekim: string;
}