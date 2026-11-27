import type { Db } from "@/server/db";

export const listCategories = (db: Db) => db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
export const listTags = (db: Db) => db.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });

export const slugify = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
