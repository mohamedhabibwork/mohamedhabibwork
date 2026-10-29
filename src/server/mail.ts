import { createTransport, type Transporter } from "nodemailer";

const esc = (s: string) =>
	s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
/** Strips CR/LF so visitor input can't inject headers via the subject. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const SMTP_IMPLICIT_TLS_PORT = 465;

let transport: Transporter | null = null;

/** SMTP transport built from SMTP_* env vars; null when host, user or password is missing. */
function mailTransport(): Transporter | null {
	if (transport) return transport;
	const host = process.env.SMTP_HOST;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASSWORD;
	if (!host || !user || !pass) return null;
	const port = Number(process.env.SMTP_PORT ?? SMTP_IMPLICIT_TLS_PORT);
	const secure = process.env.SMTP_SECURE
		? process.env.SMTP_SECURE === "true"
		: port === SMTP_IMPLICIT_TLS_PORT;
	transport = createTransport({ host, port, secure, auth: { user, pass } });
	return transport;
}

type PaymentNotice = {
	paypalOrderId: string;
	captureId: string;
	service: string;
	amount: string;
	currency: string;
	payerName: string;
	payerEmail: string;
	notes: string;
};

/** Emails the owner when a PayPal payment completes, so they can schedule the session. Never throws. */
export async function notifyOwnerOfPayment(p: PaymentNotice): Promise<boolean> {
	const from = process.env.MAIL_FROM;
	const to = process.env.CONTACT_TO;
	const smtp = mailTransport();
	if (!smtp || !from || !to) {
		console.warn(
			"Payment email skipped: SMTP_* env, MAIL_FROM or CONTACT_TO not configured",
		);
		return false;
	}
	const who = p.payerName || p.payerEmail || "A customer";
	const subject = oneLine(
		`Paid: ${p.currency} ${p.amount} for ${p.service} — ${who}`,
	).slice(0, 200);
	const lines = [
		`${who}${p.payerEmail ? ` <${p.payerEmail}>` : ""} paid ${p.currency} ${p.amount} for "${p.service}" via PayPal.`,
		p.notes ? `\nThey want to discuss:\n${p.notes}` : "",
		`\nPayPal order: ${p.paypalOrderId}${p.captureId ? `\nCapture (transaction): ${p.captureId}` : ""}`,
		"\nReply to this email to schedule the session.",
	];
	const html = `<p><strong>${esc(who)}</strong>${p.payerEmail ? ` &lt;<a href="mailto:${esc(p.payerEmail)}">${esc(p.payerEmail)}</a>&gt;` : ""} paid <strong>${esc(p.currency)} ${esc(p.amount)}</strong> for <strong>${esc(p.service)}</strong> via PayPal.</p>
${p.notes ? `<p>They want to discuss:</p><blockquote style="border-left:3px solid #c2f852;margin:0;padding:8px 16px;white-space:pre-wrap">${esc(p.notes)}</blockquote>` : ""}
<p style="color:#666;font-size:12px">PayPal order ${esc(p.paypalOrderId)}${p.captureId ? ` · transaction ${esc(p.captureId)}` : ""}. Reply to schedule the session.</p>`;
	try {
		await smtp.sendMail({
			from: { address: from, name: "Portfolio payments" },
			to,
			...(p.payerEmail ? { replyTo: p.payerEmail } : {}),
			subject,
			text: lines.join("\n"),
			html,
		});
		return true;
	} catch (error) {
		console.error(
			"Payment email failed:",
			error instanceof Error ? error.message : error,
		);
		return false;
	}
}

type ContactMessage = {
	name: string;
	email: string;
	subject: string;
	body: string;
	serviceTitle?: string;
};

/**
 * Emails a new contact-form message to the owner from MAIL_FROM.
 * Never throws: the message is already saved, so a mail failure is logged, not shown to the visitor.
 */
export async function notifyOwnerOfMessage(
	msg: ContactMessage,
): Promise<boolean> {
	const from = process.env.MAIL_FROM;
	const to = process.env.CONTACT_TO;
	const smtp = mailTransport();
	if (!smtp || !from || !to) {
		console.warn(
			"Contact email skipped: SMTP_* env, MAIL_FROM or CONTACT_TO not configured",
		);
		return false;
	}
	const tag = msg.serviceTitle ? `[${msg.serviceTitle}] ` : "";
	const subject = oneLine(
		`${tag}New message from ${msg.name}${msg.subject ? `: ${msg.subject}` : ""}`,
	).slice(0, 200);
	const serviceLine = msg.serviceTitle
		? `Service: ${msg.serviceTitle}\n\n`
		: "";
	const text = `${serviceLine}${msg.name} <${msg.email}> wrote:\n\n${msg.body}\n\n— Sent from the contact form. Reply to answer directly.`;
	const html = `${msg.serviceTitle ? `<p>Service: <strong>${esc(msg.serviceTitle)}</strong></p>` : ""}<p><strong>${esc(msg.name)}</strong> &lt;<a href="mailto:${esc(msg.email)}">${esc(msg.email)}</a>&gt; wrote:</p>
<blockquote style="border-left:3px solid #c2f852;margin:0;padding:8px 16px;white-space:pre-wrap">${esc(msg.body)}</blockquote>
<p style="color:#666;font-size:12px">Sent from the contact form. Reply to answer directly.</p>`;
	try {
		await smtp.sendMail({
			from: { address: from, name: "Portfolio contact form" },
			to,
			replyTo: msg.email,
			subject,
			text,
			html,
		});
		return true;
	} catch (error) {
		const code = (error as { code?: string }).code ?? "unknown";
		console.error(
			`Contact email failed (${code}):`,
			error instanceof Error ? error.message : error,
		);
		return false;
	}
}
