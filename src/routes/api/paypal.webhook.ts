import { createFileRoute } from "@tanstack/react-router";
import { captureOrder, PayPalError, summarizeOrder, verifyWebhook } from "#/server/paypal";
import { isKnownOrder, orderIdForCapture, recordPayment } from "#/server/payments";

type WebhookEvent = {
	id: string;
	event_type: string;
	resource: {
		id: string;
		status?: string;
		custom_id?: string;
		amount?: { currency_code: string; value: string };
		supplementary_data?: { related_ids?: { order_id?: string } };
		links?: { rel: string; href: string }[];
	};
};

/** Capture/refund events → the payment status we store. */
const CAPTURE_STATUS: Record<string, string> = {
	"PAYMENT.CAPTURE.COMPLETED": "COMPLETED",
	"PAYMENT.CAPTURE.PENDING": "PENDING",
	"PAYMENT.CAPTURE.DENIED": "DENIED",
	"PAYMENT.CAPTURE.DECLINED": "DECLINED",
	"PAYMENT.CAPTURE.REFUNDED": "REFUNDED",
	"PAYMENT.CAPTURE.REVERSED": "REVERSED",
};

/** Order id an event belongs to. Refunds only link "up" to their capture, which we look up. */
async function orderIdOf(event: WebhookEvent): Promise<string | null> {
	const direct = event.resource.supplementary_data?.related_ids?.order_id;
	if (direct) return direct;
	const up = event.resource.links?.find((l) => l.rel === "up")?.href.match(/\/captures\/([A-Z0-9]+)/)?.[1];
	return up ? orderIdForCapture(up) : null;
}

async function handle(event: WebhookEvent) {
	if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
		// Buyer approved but the page may have closed before our capture call: capture here (idempotent).
		const orderId = event.resource.id;
		if (!(await isKnownOrder(orderId))) return;
		const order = await captureOrder(orderId).catch((error) => {
			if (error instanceof PayPalError && error.message === "ORDER_ALREADY_CAPTURED") return null;
			throw error;
		});
		await recordPayment(orderId, order ? summarizeOrder(order) : { status: "APPROVED" });
		return;
	}
	const status = CAPTURE_STATUS[event.event_type];
	if (!status) return;
	const orderId = await orderIdOf(event);
	// Ignore payments that didn't come from this site's checkout.
	if (!orderId || !(event.resource.custom_id || (await isKnownOrder(orderId)))) return;
	const isCapture = !event.event_type.endsWith("REFUNDED") && !event.event_type.endsWith("REVERSED");
	await recordPayment(orderId, {
		status,
		...(isCapture ? { captureId: event.resource.id, amount: event.resource.amount?.value, currency: event.resource.amount?.currency_code, service: event.resource.custom_id } : {}),
	});
}

/**
 * POST /api/paypal/webhook — PayPal event notifications, verified with PayPal before anything is stored.
 * Subscribed events: CHECKOUT.ORDER.APPROVED and PAYMENT.CAPTURE.{COMPLETED,PENDING,DENIED,DECLINED,REFUNDED,REVERSED}.
 */
export const Route = createFileRoute("/api/paypal/webhook")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const event = (await request.json().catch(() => null)) as WebhookEvent | null;
				if (!event?.event_type || !event.resource) return new Response("Bad request", { status: 400 });
				const genuine = await verifyWebhook(request.headers, event).catch((error) => {
					console.error("PayPal webhook verification error:", error instanceof Error ? error.message : error);
					return false;
				});
				if (!genuine) return new Response("Invalid signature", { status: 400 });
				try {
					await handle(event);
				} catch (error) {
					// 500 makes PayPal retry the delivery later.
					console.error(`PayPal webhook ${event.event_type} (${event.id}) failed:`, error instanceof Error ? error.message : error);
					return new Response("Retry later", { status: 500 });
				}
				return new Response("OK");
			},
		},
	},
});
