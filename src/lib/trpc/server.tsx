import "server-only";
import { dehydrate, HydrationBoundary, type FetchQueryOptions } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { headers } from "next/headers";
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
