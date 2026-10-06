import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "#/db";
import { services } from "#/db/schema";
import { parsePrice } from "#/lib/contact";
import { createOrder, PAYPAL_CURRENCIES, PayPalError, paypalEnv } from "#/server/paypal";
import { recordPayment } from "#/server/payments";

const body = z.object({
	service: z.string().trim().regex(/^[a-z0-9-]{1,80}$/),
	notes: z.string().trim().max(1000).optional().default(""),
});

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Only this site's pages may start a checkout (blocks other sites from scripting order creation). */
function sameOrigin(request: Request) {
	const origin = request.headers.get("origin");
	return !origin || new URL(origin).host === new URL(request.url).host;
}

/**
 * POST /api/paypal/orders { service, notes? } → { id }
 * Creates a PayPal order for a published, priced service. The price is read from the database.
 */
export const Route = createFileRoute("/api/paypal/orders")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
				const parsed = body.safeParse(await request.json().catch(() => null));
				if (!parsed.success) return json({ error: "Invalid request" }, 400);
				const svc = await withDb((db) => db.query.services.findFirst({ where: and(eq(services.slug, parsed.data.service), eq(services.published, true)) }));
				const price = svc ? parsePrice(svc.startingAt) : null;
				if (!svc || !price || !PAYPAL_CURRENCIES.has(price.currency)) return json({ error: "This service can't be paid online" }, 404);
				try {
					const order = await createOrder({ slug: svc.slug, title: svc.title, amount: price.amount, currency: price.currency });
					await recordPayment(order.id, { status: order.status, environment: paypalEnv(), service: svc.slug, amount: price.amount.toFixed(2), currency: price.currency, notes: parsed.data.notes });
					return json({ id: order.id });
				} catch (error) {
					const status = error instanceof PayPalError ? error.status : 500;
					console.error("PayPal create order failed:", error instanceof Error ? error.message : error);
					return json({ error: "Couldn't start PayPal checkout. Please try again." }, status >= 500 ? 502 : 400);
				}
			},
		},
	},
});
