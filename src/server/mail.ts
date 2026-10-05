type EmailBinding = {
	send(message: { from: { email: string; name?: string }; to: string; replyTo?: string; subject: string; text: string; html: string }): Promise<{ messageId: string }>;
};

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
/** Strips CR/LF so visitor input can't inject headers via the subject. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

async function emailBinding(): Promise<EmailBinding | null> {
	try {
		const { env } = (await import("cloudflare:workers")) as { env: { EMAIL?: EmailBinding } };
		return env.EMAIL ?? null;
	} catch {
		return null;
	}
}

type ContactMessage = { name: string; email: string; subject: string; body: string; serviceTitle?: string };

/**
 * Emails a new contact-form message to the owner from MAIL_FROM.
 * Never throws: the message is already saved, so a mail failure is logged, not shown to the visitor.
 */
export async function notifyOwnerOfMessage(msg: ContactMessage): Promise<boolean> {
	const from = process.env.MAIL_FROM;
	const to = process.env.CONTACT_TO;
	const binding = await emailBinding();
	if (!binding || !from || !to) {
		console.warn("Contact email skipped: EMAIL binding, MAIL_FROM or CONTACT_TO not configured");
		return false;
	}
	const tag = msg.serviceTitle ? `[${msg.serviceTitle}] ` : "";
	const subject = oneLine(`${tag}New message from ${msg.name}${msg.subject ? `: ${msg.subject}` : ""}`).slice(0, 200);
	const serviceLine = msg.serviceTitle ? `Service: ${msg.serviceTitle}\n\n` : "";
	const text = `${serviceLine}${msg.name} <${msg.email}> wrote:\n\n${msg.body}\n\n— Sent from the contact form. Reply to answer directly.`;
	const html = `${msg.serviceTitle ? `<p>Service: <strong>${esc(msg.serviceTitle)}</strong></p>` : ""}<p><strong>${esc(msg.name)}</strong> &lt;<a href="mailto:${esc(msg.email)}">${esc(msg.email)}</a>&gt; wrote:</p>
<blockquote style="border-left:3px solid #c2f852;margin:0;padding:8px 16px;white-space:pre-wrap">${esc(msg.body)}</blockquote>
<p style="color:#666;font-size:12px">Sent from the contact form. Reply to answer directly.</p>`;
	try {
		await binding.send({ from: { email: from, name: "Portfolio contact form" }, to, replyTo: msg.email, subject, text, html });
		return true;
	} catch (error) {
		const code = (error as { code?: string }).code ?? "unknown";
		console.error(`Contact email failed (${code}):`, error instanceof Error ? error.message : error);
		return false;
	}
}
