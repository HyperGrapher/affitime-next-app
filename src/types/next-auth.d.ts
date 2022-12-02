import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   * https://stackoverflow.com/a/73099744
   */
  interface Session {
    role: string;
    vendorId: string | null;
    partnerId: string | null;
    trial: boolean;
    active: boolean;
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
