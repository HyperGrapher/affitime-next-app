/**
 * Creates (or promotes) an admin account. Replaces the old public /admin/register page.
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run admin:create
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/server/db";

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 12 chars).");
    process.exit(1);
  }
  const user = await db.user.upsert({
    where: { email },
    create: { email, name: "Admin", role: "ADMIN", emailVerified: true },
    update: { role: "ADMIN", emailVerified: true, active: true },
  });
  const hash = await hashPassword(password);
  const account = await db.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
  if (account) await db.account.update({ where: { id: account.id }, data: { password: hash } });
  else await db.account.create({ data: { accountId: user.id, providerId: "credential", userId: user.id, password: hash } });
  console.log(`✔ admin ready: ${email}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => db.$disconnect());
