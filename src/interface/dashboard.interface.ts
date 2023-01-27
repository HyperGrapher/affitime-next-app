import type { Link, Visit } from "@prisma/client";

export interface IDashboardData {
  all: string;
  active: string;
  passive: string;
  refused: string;
  awaiting: string;

}

export interface IVisitAndPayment {
  unpaidTotal: string;
  paidTotal: string;
  unpaid: string;
  paid: string;
  total: string;
  valid: string;
  invalid: string;
}

export type IPartnerAndLinks = {
  id: string;
  userId: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  partner_links: Link[];
};

export type IUnpaidItemForVendor = {
  id: string;
  userId: string;
  username: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  visits: Visit[];
  calc: number;
  links: number;
};

export type IUnpaidItemForPartner = {
  id: string;
  userId: string;
  brand: string;
  website: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  visits: Visit[];
  calc: number;
  links: number;
};
