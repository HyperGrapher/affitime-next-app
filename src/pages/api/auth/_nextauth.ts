/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

/*
If you are using findUnique() method then as the function name suggests 
you are querying your database using some Unique field; so you need to give 
a unique field as condition in findUnique function as well. 
And as you were getting that error then that means 
you didn't declare your email field as Unique in your Schema. 
So thats the reason why making email Field unique solved your error. 
https://stackoverflow.com/questions/66465315/unknown-arg-email-in-where-email-for-type-userwhereuniqueinput-graphql-node
*/

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt/types.js";
import { randomBytes } from "node:crypto";

// https://stackoverflow.com/questions/71956621/next-auth-4-session-returns-null-next-js
// https://stackoverflow.com/q/70474736
// https://github.com/nextauthjs/next-auth/discussions/4394
// https://next-auth.js.org/providers/auth0
// https://tailwindcss.com/docs/flex-direction
// https://branche.online/next-auth-credentials-provider-with-the-database-session-strategy/
// https://stackoverflow.com/questions/73308329/next-js-setup-next-auth-role-based-credentials-auth-with-prisma-ikm-error
export const authOptions: NextAuthOptions = {
  // Include user.id on session
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
      // https://stackoverflow.com/questions/67749917/custom-session-next-js-next-auth

      /*
        https://stackoverflow.com/a/68237502
        To explain things. jwt function always runs before session, 
        so whatever data you pass to jwt token will be available on session function and you can do 
        whatever you want with it. In jwt function i check if there is a user because this only 
        returns data only when you login.

      */
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

    // https://github.com/nextauthjs/next-auth/discussions/4394
    // async session({ session, token, user }) {
    //   if (token) {
    //     session.id = token.id
    //   }
    //   return session
    // },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // async signIn({ user, profile, email, credentials }): Promise<any> {
    //   console.log({ email, user, profile });
    //   console.table(credentials)
    // const userDB = await prisma.user.findUnique({
    //   where: {
    //     email: credentials?.email,
    //     password: credentials?.password,
    //   },
    // });
    // },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      type: "credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Email adresiniz",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        console.log("authorize");
        console.log(credentials);

        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const userDB = await prisma.user.findFirst({
          where: {
            email: email,
            // password: password,
          },
        });

        // Add logic here to look up the user from the credentials supplied
        const user = { id: "1", name: "J Smith", email };

        if (user) {
          console.log("*-*-*-*-*-*-* authorize return user *-*-*-*-*-*-*-*-");

          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);

// const resultUser = await prisma.user.create({
//   data: {
//     email: email,
//     password: password,
//     role: userRole,
//     trial: true,
//     active: true,
//     image: 'http://myimage.com',
//     name: "myvendor",
//   },
// });

// if (userRole === "vendor") {
//   const vendor = await prisma.vendor.create({
//     data: {
//       userId: resultUser.id,
//       fname: "fname",
//       lname: "lname",
//     },
//   });
// } else if (userRole === "partner") {
//   const partner = await prisma.partner.create({
//     data: {
//       userId: resultUser.id,
//       fname: "fname",
//       lname: "lname",
//     },
//   });
// }

// }
// else if (credentials?.callbackUrl.includes("auth/signin")) {
//   // LOGIN USER
//   console.log("\n");
//   console.log(
//     "-------------- callbackURL is LOGIN",
//     credentials?.callbackUrl
//   );
//   console.log("\n");
// }

// Add logic here to look up the user from the credentials supplied
// const user = { id: "1", name: "J Smith", email };

// if (user) {
//   console.log("\n");
//   console.log("*-*-*-*-*-*-* authorize return user *-*-*-*-*-*-*-*-");

//   // Any object returned will be saved in `user` property of the JWT
//   return user;
// } else {
//   // If you return null then an error will be displayed advising the user to check their details.
// return null;

//   // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
// }

/*

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
