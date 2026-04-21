import { createContext } from "@habib-app/api/context";
import { appRouter } from "@habib-app/api/routers/index";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import type { RequestHandler } from "@sveltejs/kit";

const handler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const handle: RequestHandler = async ({ request }) => {
	const context = await createContext({ request });

	const { response } = await handler.handle(request, {
		prefix: "/rpc",
		context,
	});

	return response ?? new Response("Not Found", { status: 404 });
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
