import type { Link } from "@prisma/client";

export interface IDashboardData {
  all: string;
  active: string;
  passive: string;
  refused: string;
  awaiting: string;
  total: string;
  valid: string;
  declined: string;
}


export type IPartnerAndLinks = {
  id: string;
  userId: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  partner_links: Link[];
}
