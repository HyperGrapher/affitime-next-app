import "server-only";
import { dehydrate, HydrationBoundary, type FetchQueryOptions } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";
import { createContext } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/root";
import { makeQueryClient } from "./query-client";

export const getQueryClient = cache(makeQueryClient);

/** Server-side tRPC (no HTTP hop): prefetch in RSC, hydrate into client components. */
export const trpc = createTRPCOptionsProxy({
  ctx: async () => createContext(await headers()),
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient({ children }: { children: ReactNode }) {
  return <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>;
}

// Prefetch helper: errors surface to the client query (and its error UI) instead of failing the whole RSC render.
export function prefetch(...queries: { queryKey: readonly unknown[] }[]) {
  const qc = getQueryClient();
  return Promise.allSettled(queries.map((q) => qc.prefetchQuery(q as unknown as FetchQueryOptions)));
}

/** Like prefetch, but a NOT_FOUND (missing row or someone else's row) becomes a real 404 instead of an error page. */
export async function prefetchOrNotFound(query: { queryKey: readonly unknown[] }) {
  try {
    await getQueryClient().fetchQuery(query as unknown as FetchQueryOptions);
  } catch (error) {
    // TRPCError (direct) or TRPCClientError wrapping it (server-side proxy): look at every place the code can live.
    const e = error as { code?: string; data?: { code?: string }; cause?: { code?: string } };
    const code = e.code ?? e.data?.code ?? e.cause?.code;
    if (code === "NOT_FOUND") notFound();
    throw error;
  }
}
