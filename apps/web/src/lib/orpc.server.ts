import { appRouter } from "@habib-app/api/routers/index";
import { createContext } from "@habib-app/api/context";
import { createRouterClient } from "@orpc/server";
import { getRequestEvent } from "$app/server";

if (typeof window !== "undefined") {
	throw new Error("orpc.server.ts should only be imported on the server");
}

export const serverClient = createRouterClient(appRouter, {
	context: async () => {
		const event = getRequestEvent();
		return createContext({ request: event.request });
	},
});
