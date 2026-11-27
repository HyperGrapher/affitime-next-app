import { z } from "zod";

export const pageInput = z.object({
  page: z.number().int().min(1).max(10_000).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().trim().max(100).optional(),
});
export type PageInput = z.infer<typeof pageInput>;

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function toPage<T>(items: T[], total: number, input: Pick<PageInput, "page" | "pageSize">): Page<T> {
  return { items, total, page: input.page, pageSize: input.pageSize, pageCount: Math.max(1, Math.ceil(total / input.pageSize)) };
}

export const skipTake = (i: Pick<PageInput, "page" | "pageSize">) => ({ skip: (i.page - 1) * i.pageSize, take: i.pageSize });
