import { createFileRoute } from "@tanstack/react-router";
import { captureOrder, getOrder, isOrderId, PayPalError, summarizeOrder } from "#/server/paypal";
import { isKnownOrder, recordPayment } from "#/server/payments";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/paypal/orders/<id>/capture → { status, payerName, amount, currency }
 * Captures an order the buyer approved in the PayPal popup and stores the result.
 * A declined card answers 422 with `restart: true` so the buttons let the buyer choose another method.
 */
export const Route = createFileRoute("/api/paypal/orders/$orderId/capture")({
	server: {
		handlers: {
			POST: async ({ params }) => {
				const orderId = params.orderId;
				if (!isOrderId(orderId) || !(await isKnownOrder(orderId))) return json({ error: "Unknown order" }, 404);
				try {
					const order = await captureOrder(orderId).catch(async (error) => {
						// Already captured (double click, or the webhook got there first): read the current state instead.
						if (error instanceof PayPalError && error.message === "ORDER_ALREADY_CAPTURED") return getOrder(orderId);
						throw error;
					});
					const summary = summarizeOrder(order);
					const status = await recordPayment(orderId, summary);
					return json({ status, payerName: summary.payerName, amount: summary.amount, currency: summary.currency });
				} catch (error) {
					if (error instanceof PayPalError && error.message === "INSTRUMENT_DECLINED") return json({ error: "Your payment method was declined.", restart: true }, 422);
					console.error("PayPal capture failed:", error instanceof Error ? error.message : error);
					return json({ error: "Payment couldn't be completed. You have not been charged." }, 502);
				}
			},
		},
	},
});
