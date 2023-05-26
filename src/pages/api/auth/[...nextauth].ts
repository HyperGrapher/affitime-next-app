/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Prisma adapter for NextAuth, optional and can be removed
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { randomBytes } from "node:crypto";
import { prisma } from "../../../server/db/client";
import { comparePassword } from "../../../utils/comparePassword";

const expireDays = 60;
const updateAgeHour = 1;
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * expireDays,
    updateAge: 60 * 60 * updateAgeHour,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Email adresiniz",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new Error("please enter email and password");
        }

        const user = await prisma.user.findFirst({
          where: { email: email },
          include: { vendor: true, partner: true },
        });

        if (!user) return null;

        const result = await comparePassword(password, user.password);

        if (!result) return null;
        else return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      const email = session.user?.email;
      if (!email) return session;

      const userDB = await prisma.user.findFirst({
        where: { email },
      });

      if (!userDB) return session;

      session.id = userDB.id as string;
      session.token = token.id as string;
      session.role = userDB.role as string;
      session.email = userDB.email as string;
      session.image = userDB.image as string;
      session.packageType = userDB.packageType as string;
      session.emailVerified = userDB.emailVerified as Date;
      session.active = userDB.active as boolean;
      session.pro = userDB.pro as boolean;
      session.trial = userDB.trial as boolean;
      session.partnerId = userDB.partner_id as string;
      session.vendorId = userDB.vendor_id as string;

      return session;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      return token;
    },

    async signIn({ user, account, profile, email, credentials }) {
      if (user) {
        const sessionToken = randomBytes(32).toString("hex");
        const sessionExpiry = new Date(Date.now() + 3600);
        await PrismaAdapter(prisma).createSession({
          sessionToken: sessionToken,
          userId: user.id,
          expires: sessionExpiry,
        });

        return true;
      }

      return false;
    },
  },
};

export default NextAuth(authOptions);
