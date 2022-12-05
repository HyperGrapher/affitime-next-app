/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { setCookie } from "cookies-next";
import { prisma } from "../../../server/db/client";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt/types.js";
import { randomBytes } from "node:crypto";
import { User } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
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
        console.log(credentials);

        const { email, password, userRole } = credentials as {
          email: string;
          password: string;
          userRole: string;
        };

        if (!email || !password) {
          throw new Error("please enter email or password");
        }

        const userDB = await prisma.user.findFirst({
          where: {
            email: email,
            // password: password,
          },
        });

        if (userDB) {
          return userDB;
        }
        console.log("\n");
        console.log("No User found");
        console.log("\n");
        return null;
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    session({ session, user, token }) {
      console.log("--------  SESSION callback ------ ", {
        session,
        user,
        token,
      }); // token created before session CB
      // session.user = token.user as any;
      return session;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("-------- JWT CALLBACK ---------");
      console.log({ token, user, account, profile, isNewUser });

      if (user) {
        console.log("setting token id as user id: ", user.id);

        token.id = user.id;
      }

      return token;
    },

    // If OAuth provider is used, it contains the full OAuth
    // * "profile" returned by your provider.
    async signIn({ user, account, profile, email, credentials }) {
      const myUser = user as User;
      console.log("\n");
      console.log("-------- SIGN IN CALLBACK---------");
      console.log({ user, account, profile, email, credentials });
      console.log("\n");

      if (user) {
        const sessionToken = randomBytes(32).toString("hex"); // Implement a function to generate the session token (you can use randomUUID as an example)
        const sessionExpiry = new Date(Date.now() + 3600000); // Implement a function to calculate the session cookie expiry date

        // const userDb = await PrismaAdapter(prisma).getUser(user.id);
        // console.log({ userDb });

        // https://stackoverflow.com/questions/67749917/custom-session-next-js-next-auth
        await PrismaAdapter(prisma).createSession({
          sessionToken: sessionToken,
          userId: user.id,
          expires: sessionExpiry, // TODO: ileri bir tarih
        });

        return true;
      }

      console.log("No USER In SIGNIN CALLBASCK");

      return false;
    },
  },
};

export default NextAuth(authOptions);

const da = {
  data: {
    user: { name: "vendor-name", email: "vendor@email.com", image: null },
    expires: "2023-01-01T14:53:45.842Z",
  },
  status: "authenticated",
};

/*




  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return randomBytes(32).toString("hex");
    },
  },
  jwt: {
    // https://stackoverflow.com/a/73197592
    // https://next-auth.js.org/configuration/options#jwt
    // https://next-auth.js.org/configuration/options#override-jwt-encode-and-decode-methods
    encode: async function (params: JWTEncodeParams): Promise<string> {
      console.log("------------>  encode", params);

      return "abcdef";
    },
    decode: async function (params: JWTDecodeParams): Promise<JWT> {
      console.log("------------>  decode", params);

      return "" as unknown as JWT;
    },
  },
  callbacks: {
    session({ session, user }) {
      console.log("--------  SESSION callback ------ ", { session, user });

      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("-------- JWT CALLBACK ---------");
      console.log({ token, user, account, profile, isNewUser });

      if (user) {
        token.id = user.id;
      }

      return token;
    },
    // If OAuth provider is used, it contains the full OAuth
    // * "profile" returned by your provider.
    async signIn({ user, account, profile, email, credentials }) {
      console.log("-------- SIGN IN CALLBACK---------");
      console.log({ user, account, profile, email, credentials });

      if (user) {
        const sessionToken = "jijsaij"; // Implement a function to generate the session token (you can use randomUUID as an example)
        const sessionExpiry = new Date(); // Implement a function to calculate the session cookie expiry date

        await PrismaAdapter(prisma).createSession({
          sessionToken: sessionToken,
          userId: user.id,
          expires: sessionExpiry,
        });

        //  const cookies = new Cookies()

        //  cookies.set('next-auth.session-token', sessionToken, {
        //      expires: sessionExpiry
        //  })

        return true;
      }
      return false;
    },
  },




****************************************************


 return await prisma.$transaction(async (tx) => {
              console.log('\n');
              console.log('TRANS');
              
              const user = await tx.user.create({
                data: {
                  email: email,
                  password: password,
                  role: userRole,
                },
              });

              if (userRole === "vendor") {
                const vendor = await tx.vendor.create({
                  data: {
                    userId: user.id,
                    fname: "fname",
                    lname: "lname",
                  },
                });
              } else if (userRole === "partner") {
                const partner = await tx.partner.create({
                  data: {
                    userId: user.id,
                    fname: "fname",
                    lname: "lname",
                  },
                });
              }

              return user;
            });



****************************************************


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
