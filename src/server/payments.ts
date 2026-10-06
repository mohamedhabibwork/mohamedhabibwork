import { eq } from "drizzle-orm";
import { withDb } from "#/db";
import { payments } from "#/db/schema";
import { notifyOwnerOfPayment } from "#/server/mail";

/**
 * How far along a payment is. Updates never move a payment backwards, so a late or retried
 * event (e.g. the capture response after a refund webhook) can't undo a newer state.
 */
const STAGE: Record<string, number> = { CREATED: 0, SAVED: 0, PAYER_ACTION_REQUIRED: 0, APPROVED: 1, PENDING: 2, COMPLETED: 3, DECLINED: 3, DENIED: 3, FAILED: 3, VOIDED: 3, PARTIALLY_REFUNDED: 4, REFUNDED: 5, REVERSED: 5 };
const stage = (status: string) => STAGE[status] ?? 0;

type PaymentFields = { status: string; environment?: string; service?: string; amount?: string; currency?: string; captureId?: string; payerName?: string; payerEmail?: string; notes?: string };

/** Drops empty values so a sparse update (e.g. a webhook without payer details) keeps what's stored. */
const present = (fields: Omit<PaymentFields, "status">) => Object.fromEntries(Object.entries(fields).filter(([, v]) => v)) as Omit<PaymentFields, "status">;

/**
 * Inserts or updates the payment for a PayPal order. Emails the owner the first time it becomes COMPLETED.
 * Returns the stored status.
 */
export async function recordPayment(orderId: string, { status, ...fields }: PaymentFields): Promise<string> {
	const { row, becameCompleted } = await withDb(async (db) => {
		const existing = await db.query.payments.findFirst({ where: eq(payments.paypalOrderId, orderId) });
		if (!existing) {
			const [created] = await db
				.insert(payments)
				.values({ paypalOrderId: orderId, status, service: fields.service ?? "", amount: fields.amount ?? "", currency: fields.currency ?? "", ...present(fields) })
				.onConflictDoNothing()
				.returning();
			return { row: created, becameCompleted: status === "COMPLETED" };
		}
		const next = stage(status) >= stage(existing.status) ? status : existing.status;
		const [updated] = await db.update(payments).set({ ...present(fields), status: next }).where(eq(payments.id, existing.id)).returning();
		return { row: updated, becameCompleted: existing.status !== "COMPLETED" && next === "COMPLETED" };
	});
	if (row && becameCompleted) await notifyOwnerOfPayment(row);
	return row?.status ?? status;
}

/** Order id for a stored capture; refund webhooks only reference the capture. */
export async function orderIdForCapture(captureId: string): Promise<string | null> {
	const row = await withDb((db) => db.query.payments.findFirst({ columns: { paypalOrderId: true }, where: eq(payments.captureId, captureId) }));
	return row?.paypalOrderId ?? null;
}

export const isKnownOrder = async (orderId: string) => Boolean(await withDb((db) => db.query.payments.findFirst({ columns: { id: true }, where: eq(payments.paypalOrderId, orderId) })));
