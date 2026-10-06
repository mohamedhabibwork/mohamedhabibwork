import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, EmptyState, Tabs } from "#/design-system/ui";
import { listPayments } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/payments")({
	loader: () => listPayments(),
	component: Payments,
});

const VARIANT: Record<string, "success" | "warning" | "danger" | "info"> = { COMPLETED: "success", PENDING: "warning", APPROVED: "info", CREATED: "info", REFUNDED: "danger", REVERSED: "danger", DENIED: "danger", DECLINED: "danger", FAILED: "danger" };
const PAYPAL_ACTIVITY = "https://www.paypal.com/activity/payment/";

function Payments() {
	const all = Route.useLoaderData();
	const [tab, setTab] = useState<"paid" | "all">("paid");
	const paid = all.filter((p) => ["COMPLETED", "PENDING", "REFUNDED", "REVERSED"].includes(p.status));
	const list = tab === "paid" ? paid : all;
	const totals = new Map<string, number>();
	for (const p of paid) if (p.status === "COMPLETED") totals.set(p.currency, (totals.get(p.currency) ?? 0) + Number(p.amount));
	const total = [...totals].map(([currency, sum]) => `${currency} ${sum.toFixed(2)}`);
	return (
		<>
			<div className="admin-page-head">
				<div>
					<h1>Payments</h1>
					<p>PayPal checkouts from service pages. Completed: {total.join(" · ") || "none yet"}.</p>
				</div>
			</div>
			<Tabs label="Filter" value={tab} onChange={setTab} items={[{ id: "paid", label: "Paid", count: paid.length }, { id: "all", label: "All checkouts", count: all.length }]} />
			{list.length === 0 ? (
				<EmptyState icon="inbox" title={tab === "paid" ? "No payments yet" : "No checkouts yet"} description="Payments appear here when someone pays on a service page." />
			) : (
				<div className="admin-list">
					{list.map((p) => (
						<article key={p.id} className="mh-card" style={{ gap: 8 }}>
							<div className="mh-row mh-row--between">
								<div>
									<strong>{p.currency} {p.amount}</strong> · {p.service}
									<div className="admin-row__sub">
										{new Date(p.createdAt).toLocaleString()} · {p.payerName || "—"}
										{p.payerEmail && <> · <a href={`mailto:${p.payerEmail}?subject=${encodeURIComponent("Scheduling your consultation")}`}>{p.payerEmail}</a></>}
									</div>
								</div>
								<div className="mh-row" style={{ gap: 4 }}>
									{p.environment === "sandbox" && <Badge variant="warning">Test</Badge>}
									<Badge variant={VARIANT[p.status] ?? "info"}>{p.status}</Badge>
									{p.captureId && <a className="mh-link" href={`${PAYPAL_ACTIVITY}${p.captureId}`} target="_blank" rel="noopener noreferrer">View in PayPal</a>}
								</div>
							</div>
							{p.notes && <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--text-muted)" }}>{p.notes}</p>}
						</article>
					))}
				</div>
			)}
		</>
	);
}
