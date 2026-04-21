import { PUBLIC_SERVER_URL } from "$env/static/public";
import type { AppRouterClient } from "@habib-app/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/svelte-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error(`Error: ${error.message}`);
    },
  }),
});

export const link = new RPCLink({
  url: `${PUBLIC_SERVER_URL}/rpc`,
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
