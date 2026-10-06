/** Contact links, service prices and booking for both the UI and JSON-LD, so what Google reads matches what visitors see. */

const digits = (phone: string) => phone.replace(/\D/g, "");

/** `tel:` link in E.164 form (`+201151978927`) so phones dial it from any country. */
export const telHref = (phone: string) => `tel:+${digits(phone)}`;
export const whatsappHref = (phone: string, text?: string) =>
	`https://wa.me/${digits(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

const CURRENCY_SYMBOLS: Record<string, string> = {
	$: "USD",
	"€": "EUR",
	"£": "GBP",
};
const CURRENCY_CODES = ["USD", "EUR", "GBP", "EGP", "SAR", "AED"];

/** Currencies PayPal can charge that services may be priced in (EGP, SAR, AED can't be charged). */
export const PAYPAL_CURRENCIES = new Set(["USD", "EUR", "GBP"]);

export type Price = { amount: number; currency: string; hourly: boolean };

/**
 * Reads the free-text "Starting at" field (`$100 / hour`, `USD 2,000`, `€80 per hour`) into a
 * structured price. Returns null when there is no recognisable amount.
 */
export function parsePrice(text: string): Price | null {
	const match =
		/([$€£])\s*([\d,.]+)|\b([A-Z]{3})\s*([\d,.]+)|([\d,.]+)\s*([A-Z]{3})\b/.exec(
			text.toUpperCase(),
		);
	if (!match) return null;
	const currency = match[1]
		? CURRENCY_SYMBOLS[match[1]]
		: (match[3] ?? match[6]);
	const amount = Number((match[2] ?? match[4] ?? match[5]).replace(/,/g, ""));
	if (
		!CURRENCY_CODES.includes(currency) ||
		!Number.isFinite(amount) ||
		amount <= 0
	)
		return null;
	return { amount, currency, hourly: /\b(hour|hr|h)\b|\/\s*h/i.test(text) };
}

const CHECKOUT_PRICE = /^\s*(?:([$€£])\s?(\d{1,6}(?:\.\d{2})?)|([A-Z]{3})\s?(\d{1,6}(?:\.\d{2})?)|(\d{1,6}(?:\.\d{2})?)\s?([A-Z]{3}))\s*(?:(?:\/|per)\s*(?:hour|hr|h))?\s*$/i;

/**
 * The price to charge at checkout, or null. Stricter than `parsePrice`: only one exact amount, optionally
 * "per hour" (one session), so marketing text like "from $2,000", "$5k" or "$50–$200" is never charged.
 */
export function parseCheckoutPrice(text: string): Price | null {
	const m = CHECKOUT_PRICE.exec(text);
	if (!m) return null;
	const currency = m[1] ? CURRENCY_SYMBOLS[m[1]] : (m[3] ?? m[6]).toUpperCase();
	const amount = Number(m[2] ?? m[4] ?? m[5]);
	return CURRENCY_CODES.includes(currency) && amount > 0 ? { amount, currency, hourly: /(?:\/|per)\s*(?:hour|hr|h)\s*$/i.test(text) } : null;
}

/** Schema.org `Offer` for a priced service; hourly prices use UN/CEFACT unit code HUR (hour). */
export function serviceOffer(price: Price, url: string) {
	return {
		"@type": "Offer",
		price: price.amount,
		priceCurrency: price.currency,
		availability: "https://schema.org/InStock",
		url,
		...(price.hourly
			? {
					priceSpecification: {
						"@type": "UnitPriceSpecification",
						price: price.amount,
						priceCurrency: price.currency,
						unitCode: "HUR",
						referenceQuantity: {
							"@type": "QuantitativeValue",
							value: 1,
							unitCode: "HUR",
						},
					},
				}
			: {}),
	};
}

type Owner = { email: string; phone: string };

/** Schema.org `ContactPoint`s: sales by phone/WhatsApp and email. */
export const contactPoints = (owner: Owner) => [
	{
		"@type": "ContactPoint",
		contactType: "sales",
		...(owner.phone ? { telephone: `+${digits(owner.phone)}` } : {}),
		email: owner.email,
		availableLanguage: ["English", "Arabic"],
	},
];
