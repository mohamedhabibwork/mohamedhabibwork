/** Contact links, service prices and booking for both the UI and JSON-LD, so what Google reads matches what visitors see. */

const digits = (phone: string) => phone.replace(/\D/g, "");

/** `tel:` link in E.164 form (`+201151978927`) so phones dial it from any country. */
export const telHref = (phone: string) => `tel:+${digits(phone)}`;
export const whatsappHref = (phone: string, text?: string) => `https://wa.me/${digits(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/**
 * Optional booking / checkout page for paid consultations (Cal.com, Calendly, Google Calendar
 * appointment schedule, PayPal or Paymob link…), set at build time. Only https URLs are used.
 */
export const BOOKING_URL = (() => {
	const raw = (import.meta.env?.VITE_BOOKING_URL as string | undefined)?.trim();
	if (!raw) return undefined;
	try {
		return new URL(raw).protocol === "https:" ? raw : undefined;
	} catch {
		return undefined;
	}
})();

const CURRENCY_SYMBOLS: Record<string, string> = { $: "USD", "€": "EUR", "£": "GBP" };
const CURRENCY_CODES = ["USD", "EUR", "GBP", "EGP", "SAR", "AED"];

export type Price = { amount: number; currency: string; hourly: boolean };

/**
 * Reads the free-text "Starting at" field (`$100 / hour`, `USD 2,000`, `€80 per hour`) into a
 * structured price. Returns null when there is no recognisable amount.
 */
export function parsePrice(text: string): Price | null {
	const match = /([$€£])\s*([\d,.]+)|\b([A-Z]{3})\s*([\d,.]+)|([\d,.]+)\s*([A-Z]{3})\b/.exec(text.toUpperCase());
	if (!match) return null;
	const currency = match[1] ? CURRENCY_SYMBOLS[match[1]] : (match[3] ?? match[6]);
	const amount = Number((match[2] ?? match[4] ?? match[5]).replace(/,/g, ""));
	if (!CURRENCY_CODES.includes(currency) || !Number.isFinite(amount) || amount <= 0) return null;
	return { amount, currency, hourly: /\b(hour|hr|h)\b|\/\s*h/i.test(text) };
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
			? { priceSpecification: { "@type": "UnitPriceSpecification", price: price.amount, priceCurrency: price.currency, unitCode: "HUR", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "HUR" } } }
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
