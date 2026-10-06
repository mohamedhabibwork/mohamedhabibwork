/**
 * PayPal REST client for Standard Checkout (Orders v2) and webhook verification.
 * PAYPAL_ENV ("live" | "sandbox", default live) picks which app to use; each has its own settings:
 * PAYPAL_{LIVE,SANDBOX}_CLIENT_ID, PAYPAL_{LIVE,SANDBOX}_CLIENT_SECRET (secret), PAYPAL_{LIVE,SANDBOX}_WEBHOOK_ID.
 * Docs: https://developer.paypal.com/studio/checkout/standard/integrate
 */

export { PAYPAL_CURRENCIES } from "#/lib/contact";

/** PayPal order ids are upper-case alphanumerics; anything else is rejected before calling the API. */
export const isOrderId = (id: string) => /^[A-Z0-9]{10,40}$/.test(id);

export class PayPalError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly debugId?: string,
	) {
		super(message);
	}
}

export type PayPalEnv = "live" | "sandbox";

/** The active PayPal app. Switch with PAYPAL_ENV; anything but "sandbox" means live. */
export const paypalEnv = (): PayPalEnv => (process.env.PAYPAL_ENV === "sandbox" ? "sandbox" : "live");

const setting = (name: "CLIENT_ID" | "CLIENT_SECRET" | "WEBHOOK_ID") => process.env[`PAYPAL_${paypalEnv().toUpperCase()}_${name}`]?.trim() || undefined;

/** What the browser needs to render the buttons for the active app, or null when it isn't configured. */
export function paypalPublicConfig(): { clientId: string; env: PayPalEnv } | null {
	const clientId = setting("CLIENT_ID");
	return clientId && setting("CLIENT_SECRET") ? { clientId, env: paypalEnv() } : null;
}

function config() {
	const clientId = setting("CLIENT_ID");
	const secret = setting("CLIENT_SECRET");
	if (!clientId || !secret) throw new PayPalError(`PayPal (${paypalEnv()}) is not configured`, 503);
	const base = paypalEnv() === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
	return { clientId, secret, base };
}

async function accessToken(): Promise<{ token: string; base: string }> {
	const { clientId, secret, base } = config();
	const res = await fetch(`${base}/v1/oauth2/token`, {
		method: "POST",
		headers: { Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
		body: "grant_type=client_credentials",
	});
	if (!res.ok) throw new PayPalError(`PayPal auth failed (${res.status})`, 502, res.headers.get("paypal-debug-id") ?? undefined);
	const data = (await res.json()) as { access_token: string };
	return { token: data.access_token, base };
}

async function call<T>(path: string, init: { method: "GET" | "POST"; body?: unknown; requestId?: string }): Promise<T> {
	const { token, base } = await accessToken();
	const res = await fetch(`${base}${path}`, {
		method: init.method,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			Prefer: "return=representation",
			...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
		},
		body: init.body === undefined ? undefined : JSON.stringify(init.body),
	});
	const debugId = res.headers.get("paypal-debug-id") ?? undefined;
	const data = (await res.json().catch(() => ({}))) as T & { message?: string; details?: { issue?: string }[] };
	if (!res.ok) {
		const issue = data.details?.[0]?.issue ?? data.message ?? "request failed";
		console.error(`PayPal ${init.method} ${path} → ${res.status} ${issue} (debug id ${debugId})`);
		throw new PayPalError(issue, res.status, debugId);
	}
	return data;
}

type Money = { currency_code: string; value: string };
type Capture = { id: string; status: string; amount: Money };
export type PayPalOrder = {
	id: string;
	status: string;
	payer?: { name?: { given_name?: string; surname?: string }; email_address?: string };
	purchase_units?: { reference_id?: string; custom_id?: string; amount?: Money; payments?: { captures?: Capture[] } }[];
};

export type OrderItem = { slug: string; title: string; amount: number; currency: string };

/** Creates a CAPTURE order for one service. The amount always comes from the database, never the browser. */
export function createOrder(item: OrderItem) {
	return call<PayPalOrder>("/v2/checkout/orders", {
		method: "POST",
		requestId: crypto.randomUUID(),
		body: {
			intent: "CAPTURE",
			purchase_units: [
				{
					reference_id: item.slug,
					custom_id: item.slug,
					description: item.title.slice(0, 127),
					amount: { currency_code: item.currency, value: item.amount.toFixed(2) },
				},
			],
			application_context: { brand_name: "Mohamed Habib", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" },
		},
	});
}

/**
 * Captures an approved order. Each attempt gets its own request id so a retry after a declined card isn't
 * answered from PayPal's cache; an order can still only be captured once (ORDER_ALREADY_CAPTURED).
 */
export const captureOrder = (orderId: string) => call<PayPalOrder>(`/v2/checkout/orders/${orderId}/capture`, { method: "POST", body: {}, requestId: crypto.randomUUID() });

export const getOrder = (orderId: string) => call<PayPalOrder>(`/v2/checkout/orders/${orderId}`, { method: "GET" });

/** What a captured (or fetched) order tells us, as an update for `updatePayment`. */
export function orderUpdate(order: PayPalOrder) {
	const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
	return {
		status: capture?.status ?? order.status,
		captureId: capture?.id,
		payerName: [order.payer?.name?.given_name, order.payer?.name?.surname].filter(Boolean).join(" "),
		payerEmail: order.payer?.email_address,
		paid: capture ? { amount: capture.amount.value, currency: capture.amount.currency_code } : undefined,
	};
}

const WEBHOOK_HEADERS = {
	auth_algo: "paypal-auth-algo",
	cert_url: "paypal-cert-url",
	transmission_id: "paypal-transmission-id",
	transmission_sig: "paypal-transmission-sig",
	transmission_time: "paypal-transmission-time",
} as const;

/** Asks PayPal whether a webhook delivery is genuine (signed for the active app's webhook id). */
export async function verifyWebhook(headers: Headers, event: unknown): Promise<boolean> {
	const webhookId = setting("WEBHOOK_ID");
	if (!webhookId) {
		console.error(`PayPal webhook rejected: PAYPAL_${paypalEnv().toUpperCase()}_WEBHOOK_ID is not set`);
		return false;
	}
	const fields = Object.fromEntries(Object.entries(WEBHOOK_HEADERS).map(([key, header]) => [key, headers.get(header) ?? ""]));
	if (Object.values(fields).some((v) => !v)) return false;
	const result = await call<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
		method: "POST",
		body: { ...fields, webhook_id: webhookId, webhook_event: event },
	});
	return result.verification_status === "SUCCESS";
}
