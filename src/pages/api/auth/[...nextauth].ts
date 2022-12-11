/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt/types.js";
import { randomBytes } from "node:crypto";
import { comparePassword } from "../../../utils/comparePassword";

const expireDays = 60;
const updateAgeHour = 1;
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * expireDays,
    updateAge: 60 * 60 * updateAgeHour, // 24 hours
  },
  // Include user.id on session
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      type: "credentials",
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Email adresiniz",
        },
        password: { label: "Password", type: "password" },
        userRole: {},
        callbackUrl: {},
      },

      async authorize(credentials, req) {
        console.log("authorize");
        // console.log(credentials);

        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        console.log("authorize", { email, password });

        if (!email || !password) {
          throw new Error("please enter email and password");
        }

        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
          include: { vendor: true, partner: true },
        });

        console.log({ user });

        if (!user) throw new Error("User not found!!");

        const result = comparePassword(password, user.password);
        console.log({ result });

        if (!result) throw new Error("Wrong Credentials!!");
        else return user;
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, user, token }) {
      console.log("--------  SESSION callback ------ ");
      const email = session.user?.email;

      if (!email) return session;

      const userDB = await prisma.user.findUnique({
        where: { email },
      });

      if (!userDB) return session;

      session.id = token.id as string;
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
      console.log("-------- JWT CALLBACK ---------");
      // console.log({ token, user, account, profile, isNewUser });
      // Sadece token data iceriyor
      if (user) {
        // console.log("setting token id as user id: ", user.id);

        token.id = user.id;
      }

      return token;
    },

    // If OAuth provider is used, it contains the full OAuth
    // * "profile" returned by your provider.
    async signIn({ user, account, profile, email, credentials }) {
      console.log("-------- SIGN IN CALLBACK---------");
      // console.log({ user, account, profile, email, credentials });

      if (user) {
        const sessionToken = randomBytes(32).toString("hex");
        // Implement a function to generate the session token (you can use randomUUID as an example)
        const sessionExpiry = new Date(Date.now() + 3600); // cookie uzerinde etkisi yok
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

/*
    https://stackoverflow.com/a/73197592
    https://next-auth.js.org/configuration/options#jwt
    https://next-auth.js.org/configuration/options#override-jwt-encode-and-decode-methods
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return randomBytes(32).toString("hex");
    },
  },
  jwt: {

    encode: async function (params: JWTEncodeParams): Promise<string> {
      console.log("------------>  encode", params);

      return "abcdef";
    },
    decode: async function (params: JWTDecodeParams): Promise<JWT> {
      console.log("------------>  decode", params);

      return "" as unknown as JWT;
    },
  },



***************************************************
***************************************************


authorize
[Object: null prototype] {
  csrfToken: '5daebea6304828fabe41c1017871aeccbd74ec5f6b6b59784e2669738f6eb092',
  email: 'vendor@email.com',
  password: 'ssdsdsdsdsdsd'
}
prisma:query SELECT `affprisma`.`User`.`id`, `affprisma`.`User`.`name`, `affprisma`.`User`.`email`, `affprisma`.`User`.`emailVerified`, `affprisma`.`User`.`image`, `affprisma`.`User`.`active`, `affprisma`.`User`.`trial` FROM `affprisma`.`User` WHERE `affprisma`.`User`.`email` = ? LIMIT ? OFFSET ?
-------- SIGN IN CALLBACK---------
-------- JWT CALLBACK ---------
------------>  encode {
  secret: 'AFFIL_KX335nUDsH!1v9M6yIsf&GpJX',
  maxAge: 2592000,
  encode: [AsyncFunction: encode],
  decode: [AsyncFunction: decode],
  token: {
    name: 'J Smith',
    email: 'burak@gmail.com',
    picture: undefined,
    sub: '1',
    id: '1'
  }
}



*/
