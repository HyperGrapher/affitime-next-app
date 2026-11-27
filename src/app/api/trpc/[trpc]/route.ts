import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/root";
import { createContext } from "@/server/trpc/init";
import { env } from "@/env";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req.headers),
    onError: ({ path, error }) => {
      if (env.NODE_ENV === "development" || error.code === "INTERNAL_SERVER_ERROR") console.error(`[trpc] ${path ?? "?"}: ${error.message}`);
    },
  });

export { handler as GET, handler as POST };
