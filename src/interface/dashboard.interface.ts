import type { Link } from "@prisma/client";

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
