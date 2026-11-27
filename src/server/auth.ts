import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env";
import { db } from "@/server/db";
import { hashIp } from "@/lib/ip";
import { sendTemplatedEmail } from "@/server/services/email";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  user: {
    additionalFields: {
      // input:false → clients can never set these through the auth API (no role escalation at sign-up)
      role: { type: "string", required: false, defaultValue: "PARTNER", input: false },
      active: { type: "boolean", required: false, defaultValue: true, input: false },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendTemplatedEmail("CHANGE_EMAIL", user.email, { name: user.name, url, newEmail }, user.name);
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      await sendTemplatedEmail("RESET_PASSWORD", user.email, { name: user.name, url }, user.name);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendTemplatedEmail("VERIFY_EMAIL", user.email, { name: user.name, url }, user.name);
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24, cookieCache: { enabled: true, maxAge: 60 } },
  rateLimit: {
    enabled: true, // also in development so the behaviour is visible
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 8 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 5 },
      "/send-verification-email": { window: 300, max: 5 },
    },
  },
  advanced: { useSecureCookies: env.NODE_ENV === "production" },
  databaseHooks: {
    session: {
      create: {
        // Remember sign-in IPs of partners/vendors/staff so their own clicks are flagged as self-clicks.
        after: async (session) => {
          if (!session.ipAddress) return;
          try {
            const ipHash = hashIp(session.ipAddress);
            const lastSeenAt = new Date();
            await db.knownIp.upsert({
              where: { ipHash_userId: { ipHash, userId: session.userId } },
              create: { ipHash, userId: session.userId, lastSeenAt },
              update: { lastSeenAt },
            });
          } catch (error) {
            console.error("[auth] known-ip upsert failed", error);
          }
        },
      },
    },
  },
  plugins: [nextCookies()], // must be last
});

export type AuthSession = typeof auth.$Infer.Session;
