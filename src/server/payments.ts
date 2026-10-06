import { and, eq } from "drizzle-orm";
import { withDb } from "#/db";
import { payments } from "#/db/schema";
import { notifyOwnerOfPayment } from "#/server/mail";

/**
 * How far along a payment is. Updates never move a payment backwards, so a late or retried
 * event (e.g. the capture response after a refund webhook) can't undo a newer state.
 */
const STAGE: Record<string, number> = {
	CREATED: 0, SAVED: 0, PAYER_ACTION_REQUIRED: 0, APPROVED: 1, PENDING: 2,
	COMPLETED: 3, AMOUNT_MISMATCH: 3, DECLINED: 3, DENIED: 3, FAILED: 3, VOIDED: 3,
	PARTIALLY_REFUNDED: 4, REFUNDED: 5, REVERSED: 5,
};
const stage = (status: string) => STAGE[status] ?? 0;
const MAX_ATTEMPTS = 3;

type NewPayment = { status: string; environment: string; service: string; amount: string; currency: string; notes: string };

/** Records an order this site just created. The amount and currency stored here are what the buyer must pay. */
export async function createPayment(orderId: string, payment: NewPayment) {
	await withDb((db) => db.insert(payments).values({ paypalOrderId: orderId, ...payment }).onConflictDoNothing());
}

export type PaymentUpdate = {
	status: string;
	captureId?: string;
	payerName?: string;
	payerEmail?: string;
	/** Money PayPal reports as captured; checked against the stored price, never stored over it. */
	paid?: { amount: string; currency: string };
	/** Amount of a refund event; decides REFUNDED vs PARTIALLY_REFUNDED. */
	refunded?: string;
};

type Row = typeof payments.$inferSelect;

/** The status to store, given what PayPal reported and what we already have. */
function nextStatus(existing: Row, update: PaymentUpdate): string {
	let status = update.status;
	if (update.paid && (status === "COMPLETED" || status === "PENDING")) {
		const matches = Number(update.paid.amount) === Number(existing.amount) && update.paid.currency === existing.currency;
		if (!matches) {
			console.error(`PayPal order ${existing.paypalOrderId}: paid ${update.paid.currency} ${update.paid.amount}, expected ${existing.currency} ${existing.amount}`);
			status = "AMOUNT_MISMATCH";
		}
	}
	if (status === "REFUNDED" && update.refunded && Number(update.refunded) < Number(existing.amount)) status = "PARTIALLY_REFUNDED";
	return stage(status) >= stage(existing.status) ? status : existing.status;
}

/**
 * Applies a PayPal update to an order this site created; unknown orders are ignored (returns null).
 * The status change is a compare-and-set on the previous status, so concurrent capture + webhook
 * calls can't both see "not yet paid" — only the one that flips it to COMPLETED emails the owner.
 */
export async function updatePayment(orderId: string, update: PaymentUpdate): Promise<string | null> {
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const result = await withDb(async (db) => {
			const existing = await db.query.payments.findFirst({ where: eq(payments.paypalOrderId, orderId) });
			if (!existing) return { status: null, row: null, changed: false };
			const status = nextStatus(existing, update);
			const details = Object.fromEntries(Object.entries({ captureId: update.captureId, payerName: update.payerName, payerEmail: update.payerEmail }).filter(([, v]) => v));
			const [row] = await db
				.update(payments)
				.set({ ...details, status })
				.where(and(eq(payments.id, existing.id), eq(payments.status, existing.status)))
				.returning();
			return { status, row: row ?? null, changed: Boolean(row) && existing.status !== "COMPLETED" && status === "COMPLETED" };
		});
		if (result.status === null) return null;
		if (!result.row) continue; // Another request changed the status first; re-read and re-apply.
		if (result.changed) await notifyOwnerOfPayment(result.row);
		return result.row.status;
	}
	throw new Error(`PayPal order ${orderId}: status kept changing, update not applied`);
}

/** Order id for a stored capture; refund webhooks only reference the capture. */
export async function orderIdForCapture(captureId: string): Promise<string | null> {
	const row = await withDb((db) => db.query.payments.findFirst({ columns: { paypalOrderId: true }, where: eq(payments.captureId, captureId) }));
	return row?.paypalOrderId ?? null;
}

export const isKnownOrder = async (orderId: string) => Boolean(await withDb((db) => db.query.payments.findFirst({ columns: { id: true }, where: eq(payments.paypalOrderId, orderId) })));
