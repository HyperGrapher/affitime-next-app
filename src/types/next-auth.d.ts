import { type DefaultSession } from "next-auth";

declare module "next-auth" {

  interface Session {
    id: string;
    email: string;
    role: string;
    emailVerified: Date;
    vendorId: string | null;
    partnerId: string | null;
    trial: boolean;
    active: boolean;
    pro: boolean;
    packageType: string;
    ipdata: unknown;
    [key: string]: string;
    user?: {
      id: string;
      role: string;
      vendorId: string | null;
      partnerId: string | null;
      trial: boolean;
      active: boolean;
    } & DefaultSession["user"];
  }
}
