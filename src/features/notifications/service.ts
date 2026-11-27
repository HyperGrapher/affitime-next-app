import type { Db, Tx } from "@/server/db";
import type { NotificationType, Prisma } from "@/generated/prisma/client";
import { skipTake, toPage, type PageInput } from "@/lib/pagination";

export async function notify(
  client: Db | Tx,
  userId: string,
  type: NotificationType,
  data: Record<string, string | number | null> = {},
  href?: string,
) {
  await client.notification.create({ data: { userId, type, data: data as Prisma.InputJsonValue, href: href ?? null } });
}

export async function listNotifications(db: Db, userId: string, input: PageInput & { unreadOnly?: boolean }) {
  const where: Prisma.NotificationWhereInput = { userId, ...(input.unreadOnly ? { readAt: null } : {}) };
  const [items, total] = await Promise.all([
    db.notification.findMany({ where, orderBy: { createdAt: "desc" }, ...skipTake(input) }),
    db.notification.count({ where }),
  ]);
  return toPage(
    items.map((n) => ({ id: n.id, type: n.type, data: n.data as Record<string, string | number | null>, href: n.href, read: !!n.readAt, createdAt: n.createdAt })),
    total,
    input,
  );
}

export const unreadCount = (db: Db, userId: string) => db.notification.count({ where: { userId, readAt: null } });

export async function markRead(db: Db, userId: string, id: string) {
  await db.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
}

export async function markAllRead(db: Db, userId: string) {
  await db.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
}
