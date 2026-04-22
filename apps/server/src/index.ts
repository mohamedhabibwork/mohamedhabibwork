import { createContext } from "@habib-app/api/context";
import { appRouter } from "@habib-app/api/routers/index";
import { env } from "@habib-app/env/server";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
	})
);

const schemaConverters = [new ZodToJsonSchemaConverter()];

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new SmartCoercionPlugin({
			schemaConverters,
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const openAPIGenerator = new OpenAPIGenerator({
	schemaConverters,
});

// Handle RPC requests at /rpc
app.post("/rpc", async (c) => {
	const context = await createContext({
		request: c.req.raw,
		env: c.env as Parameters<typeof createContext>[0]["env"],
	});

	const rpcResult = await rpcHandler.handle(c.req.raw, {
		prefix: "/rpc",
		context,
	});

	if (rpcResult.matched) {
		return c.newResponse(rpcResult.response.body, rpcResult.response);
	}

	return c.json({ error: "Not found" }, 404);
});

// OpenAPI spec endpoint
app.get("/spec.json", async (c) => {
	const spec = await openAPIGenerator.generate(appRouter, {
		info: {
			title: "Habib App API",
			version: "1.0.0",
		},
		servers: [{ url: "/api" }],
	});

	return c.json(spec);
});

// Scalar API Reference UI
app.get("/api-reference", (c) => {
	const html = `
    <!doctype html>
    <html>
      <head>
        <title>Habib App API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.dev/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
          })
        </script>
      </body>
    </html>
  `;

	return c.html(html);
});

// Handle all other API requests
app.use("/api/*", async (c, next) => {
	const context = await createContext({
		request: c.req.raw,
		env: c.env as Parameters<typeof createContext>[0]["env"],
	});

	const apiResult = await apiHandler.handle(c.req.raw, {
		prefix: "/api",
		context,
	});

	if (apiResult.matched) {
		return c.newResponse(apiResult.response.body, apiResult.response);
	}

	await next();
});

app.get("/", (c) =>
	c.json({
		status: "OK",
		routes: ["/rpc", "/api-reference", "/spec.json", "/api/*", "/"],
	})
);

export default app;
