import { useEffect, useRef, useState } from "react";
import { Alert, Textarea } from "#/design-system/ui";
import { track } from "#/lib/analytics";
import { PAYPAL_CURRENCIES, type Price } from "#/lib/contact";

/** Public settings of the active PayPal app, from the server (`paypalPublicConfig`). The secret never leaves the server. */
export type PayPalPublic = { clientId: string; env: "live" | "sandbox" };

export const canPayOnline = (price: Price | null, paypal: PayPalPublic | null): price is Price => Boolean(price && paypal && PAYPAL_CURRENCIES.has(price.currency));

type ButtonsActions = { restart: () => Promise<void> };
type PayPalButtons = { render: (el: HTMLElement) => Promise<void>; close: () => Promise<void> };
type PayPalNamespace = {
	Buttons: (options: {
		style?: Record<string, string | number>;
		createOrder: () => Promise<string>;
		onApprove: (data: { orderID: string }, actions: ButtonsActions) => Promise<void>;
		onError?: (error: unknown) => void;
	}) => PayPalButtons;
};

let sdk: Promise<PayPalNamespace> | null = null;

/** Loads the PayPal JS SDK once per page (https://developer.paypal.com/sdk/js/configuration/). */
function loadPayPal(clientId: string, currency: string): Promise<PayPalNamespace> {
	sdk ??= new Promise((resolve, reject) => {
		const params = new URLSearchParams({ "client-id": clientId, currency, intent: "capture", components: "buttons" });
		const script = document.createElement("script");
		script.src = `https://www.paypal.com/sdk/js?${params}`;
		script.async = true;
		script.onload = () => {
			const paypal = (window as { paypal?: PayPalNamespace }).paypal;
			if (paypal) resolve(paypal);
			else reject(new Error("PayPal SDK loaded without the paypal global"));
		};
		script.onerror = () => {
			sdk = null;
			reject(new Error("PayPal SDK failed to load"));
		};
		document.head.appendChild(script);
	});
	return sdk;
}

async function postJson<T>(url: string, body?: unknown): Promise<{ ok: boolean; data: Partial<T> & { error?: string } }> {
	const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
	return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

type Result = { kind: "paid"; payerName: string } | { kind: "error"; message: string } | null;

/** PayPal Standard Checkout buttons for one priced service, with an optional "what to discuss" note. */
export function PayPalCheckout({ service, price, paypal }: { service: { slug: string; title: string }; price: Price; paypal: PayPalPublic }) {
	const container = useRef<HTMLDivElement>(null);
	const notes = useRef("");
	const [loading, setLoading] = useState(true);
	const [result, setResult] = useState<Result>(null);

	useEffect(() => {
		let buttons: PayPalButtons | null = null;
		let cancelled = false;
		loadPayPal(paypal.clientId, price.currency)
			.then((paypal) => {
				if (cancelled || !container.current) return;
				buttons = paypal.Buttons({
					style: { layout: "vertical", shape: "rect", color: "gold", label: "pay", height: 48 },
					createOrder: async () => {
						setResult(null);
						const res = await postJson<{ id: string }>("/api/paypal/orders", { service: service.slug, notes: notes.current });
						if (!res.ok || !res.data.id) throw new Error(res.data.error ?? "Couldn't start checkout");
						track("begin_checkout", { currency: price.currency, value: price.amount, item_id: service.slug });
						return res.data.id;
					},
					onApprove: async ({ orderID }, actions) => {
						const res = await postJson<{ status: string; payerName: string; amount: string; currency: string; restart: boolean }>(`/api/paypal/orders/${orderID}/capture`);
						if (res.data.restart) return actions.restart();
						if (!res.ok || !["COMPLETED", "PENDING"].includes(res.data.status ?? "")) {
							setResult({ kind: "error", message: res.data.error ?? "Payment couldn't be completed. You have not been charged." });
							return;
						}
						track("purchase", { transaction_id: orderID, value: Number(res.data.amount) || price.amount, currency: res.data.currency || price.currency, item_id: service.slug });
						setResult({ kind: "paid", payerName: res.data.payerName ?? "" });
					},
					onError: (error) => {
						console.error("PayPal checkout error:", error);
						setResult({ kind: "error", message: "PayPal checkout didn't complete. Please try again or message me instead." });
					},
				});
				return buttons.render(container.current);
			})
			.catch((error) => {
				console.error(error);
				if (!cancelled) setResult({ kind: "error", message: "PayPal couldn't load. Check your connection or ad blocker, or message me instead." });
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
			buttons?.close().catch(() => {});
		};
	}, [paypal.clientId, service.slug, price.amount, price.currency]);

	if (result?.kind === "paid") {
		return (
			<Alert variant="success" title="Payment received — thank you!">
				{result.payerName ? `${result.payerName.split(" ")[0]}, I'll` : "I'll"} email you within 24 hours to schedule your session. PayPal has sent your receipt.
			</Alert>
		);
	}
	return (
		<div className="mh-card" style={{ gap: 16 }}>
			{paypal.env === "sandbox" && (
				<Alert variant="warning" title="Test mode">
					PayPal sandbox — no real money moves. Pay with a sandbox buyer account.
				</Alert>
			)}
			<Textarea
				label="What would you like to discuss? (optional)"
				rows={3}
				maxLength={1000}
				onChange={(e) => {
					notes.current = e.target.value;
				}}
			/>
			{/* PayPal's iframe paints white; give it a deliberate light panel so it reads well in both themes. */}
			<div ref={container} aria-busy={loading} style={{ minHeight: 120, background: "#fff", borderRadius: 12, padding: 12 }} />
			{loading && <p style={{ margin: 0, color: "var(--text-muted)" }}>Loading secure PayPal checkout…</p>}
			<div aria-live="polite">{result?.kind === "error" && <Alert variant="danger" title="Not paid">{result.message}</Alert>}</div>
			<p style={{ margin: 0, fontSize: 13, color: "var(--text-subtle)" }}>Pay with PayPal or a debit/credit card. After payment I'll email you to book a time that suits you.</p>
		</div>
	);
}
