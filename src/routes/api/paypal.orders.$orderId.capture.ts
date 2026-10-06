import { createFileRoute } from "@tanstack/react-router";
import { captureOrder, getOrder, isOrderId, orderUpdate, PayPalError } from "#/server/paypal";
import { isKnownOrder, updatePayment } from "#/server/payments";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/paypal/orders/<id>/capture → { status, payerName, amount, currency }
 * Captures an order this site created, after the buyer approved it in the PayPal popup.
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
					const update = orderUpdate(order);
					const status = await updatePayment(orderId, update);
					return json({ status, payerName: update.payerName, amount: update.paid?.amount ?? "", currency: update.paid?.currency ?? "" });
				} catch (error) {
					if (error instanceof PayPalError && error.message === "INSTRUMENT_DECLINED") return json({ error: "Your payment method was declined.", restart: true }, 422);
					console.error("PayPal capture failed:", error instanceof Error ? error.message : error);
					return json({ error: "Payment couldn't be completed. You have not been charged." }, 502);
				}
			},
		},
	},
});
