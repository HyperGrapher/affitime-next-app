/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

/*
If you are using findUnique() method then as the function name suggests 
you are querying your database using some Unique field; so you need to give 
a unique field as condition in findUnique function as well. 
And as you were getting that error then that means 
you didn't declare your email field as Unique in your Schema. 
So thats the reason why making email Field unique solved your error. 
https://stackoverflow.com/questions/66465315/unknown-arg-email-in-where-email-for-type-userwhereuniqueinput-graphql-node

 const user = await User.findOne({
          email,
          // becasue in pre.save I excluded returning password in api response
        }).select("+password");
*/

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt/types.js";
import { randomBytes } from "node:crypto";
import { User } from "@prisma/client";
// https://stackoverflow.com/questions/71956621/next-auth-4-session-returns-null-next-js
// https://stackoverflow.com/q/70474736
// https://github.com/nextauthjs/next-auth/discussions/4394
// https://next-auth.js.org/providers/auth0
// https://tailwindcss.com/docs/flex-direction
// https://branche.online/next-auth-credentials-provider-with-the-database-session-strategy/
// https://stackoverflow.com/questions/73308329/next-js-setup-next-auth-role-based-credentials-auth-with-prisma-ikm-error
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
        console.log('No User found');
        console.log("\n");
        return null
        

        // SIGNUP
        // if (credentials?.callbackUrl.includes("auth/signup")) {
        console.log("\n");
        console.log(
          "-------------- callbackURL is SIGNUP",
          credentials?.callbackUrl,
          { userRole, password }
        );
        console.log("\n");

        console.log("No User With provided Email -> Creating One");

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
      },
    }),
    // ...add more providers here
  ],
  callbacks: {

    session({ session, user }) {
      console.log("--------  SESSION callback ------ ", { session, user });

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
        const sessionToken = randomBytes(32).toString("hex");// Implement a function to generate the session token (you can use randomUUID as an example)
        const sessionExpiry =  new Date(Date.now() + 3600000); // Implement a function to calculate the session cookie expiry date

        await PrismaAdapter(prisma).createSession({
          sessionToken: sessionToken,
          userId: user.id,
          expires: sessionExpiry, // TODO: ileri bir tarih
        });

        //  const cookies = new Cookies()

        //  cookies.set('next-auth.session-token', sessionToken, {
        //      expires: sessionExpiry
        //  })

        return true;
      }

      console.log('No USER In SIGNIN CALLBASCK');
      
      return false;
    },
  },


};

export default NextAuth(authOptions);

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
