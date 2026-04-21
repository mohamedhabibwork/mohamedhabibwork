import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { getRequestEvent } from "$app/server";

if (typeof window !== "undefined") {
	throw new Error("orpc.server.ts should only be imported on the server");
}

const link = new RPCLink({
	url: async () => `${getRequestEvent().url.origin}/rpc`,
	async fetch(request, init) {
		return getRequestEvent().fetch(request, init);
	},
});

export const serverClient = createORPCClient(link);
