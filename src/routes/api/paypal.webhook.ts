import { createFileRoute } from "@tanstack/react-router";
import { captureOrder, orderUpdate, PayPalError, verifyWebhook } from "#/server/paypal";
import { isKnownOrder, orderIdForCapture, updatePayment } from "#/server/payments";

type WebhookEvent = {
	id: string;
	event_type: string;
	resource: {
		id: string;
		amount?: { currency_code: string; value: string };
		supplementary_data?: { related_ids?: { order_id?: string } };
		links?: { rel: string; href: string }[];
	};
};

/** Capture events → the payment status we store. */
const CAPTURE_STATUS: Record<string, string> = {
	"PAYMENT.CAPTURE.COMPLETED": "COMPLETED",
	"PAYMENT.CAPTURE.PENDING": "PENDING",
	"PAYMENT.CAPTURE.DENIED": "DENIED",
	"PAYMENT.CAPTURE.DECLINED": "DECLINED",
	"PAYMENT.CAPTURE.REVERSED": "REVERSED",
};
const REFUNDED = "PAYMENT.CAPTURE.REFUNDED";

/** Order id an event belongs to. Refunds only link "up" to their capture, which we look up. */
async function orderIdOf(event: WebhookEvent): Promise<string | null> {
	const direct = event.resource.supplementary_data?.related_ids?.order_id;
	if (direct) return direct;
	const up = event.resource.links?.find((l) => l.rel === "up")?.href.match(/\/captures\/([A-Z0-9]+)/)?.[1];
	return up ? orderIdForCapture(up) : null;
}

/** Applies an event to an order this site created. Payments made elsewhere on the PayPal account are ignored. */
async function handle(event: WebhookEvent) {
	if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
		// Buyer approved but the page may have closed before our capture call: capture here.
		const orderId = event.resource.id;
		if (!(await isKnownOrder(orderId))) return;
		const order = await captureOrder(orderId).catch((error) => {
			if (error instanceof PayPalError && error.message === "ORDER_ALREADY_CAPTURED") return null;
			throw error;
		});
		await updatePayment(orderId, order ? orderUpdate(order) : { status: "APPROVED" });
		return;
	}
	const orderId = await orderIdOf(event);
	if (!orderId) return;
	if (event.event_type === REFUNDED) {
		await updatePayment(orderId, { status: "REFUNDED", refunded: event.resource.amount?.value });
		return;
	}
	const status = CAPTURE_STATUS[event.event_type];
	if (!status) return;
	const money = event.resource.amount;
	await updatePayment(orderId, { status, captureId: event.resource.id, paid: money ? { amount: money.value, currency: money.currency_code } : undefined });
}

/**
 * POST /api/paypal/webhook — PayPal event notifications, verified with PayPal before anything is stored.
 * Handles CHECKOUT.ORDER.APPROVED and PAYMENT.CAPTURE.{COMPLETED,PENDING,DENIED,DECLINED,REFUNDED,REVERSED}.
 * Answers 500 only for failures worth retrying (PayPal or database outages), so PayPal doesn't retry for days.
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
					const permanent = error instanceof PayPalError && error.status < 500;
					console.error(`PayPal webhook ${event.event_type} (${event.id}) failed${permanent ? " (not retried)" : ""}:`, error instanceof Error ? error.message : error);
					if (!permanent) return new Response("Retry later", { status: 500 });
				}
				return new Response("OK");
			},
		},
	},
});
