import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false },
      dehydrate: { serializeData: superjson.serialize, shouldDehydrateQuery: (q) => defaultShouldDehydrateQuery(q) || q.state.status === "pending" },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });
}
