import nodemailer from "nodemailer";
import type { Context } from "../context";

export interface SendEmailOptions {
	html: string;
	subject: string;
	to: string;
}

export async function sendEmail(
	context: Pick<Context, "env">,
	options: SendEmailOptions
): Promise<void> {
	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = context.env;

	if (!(SMTP_HOST && SMTP_USER && SMTP_PASS)) {
		console.warn("SMTP not configured, skipping email send");
		return;
	}

	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT) || 587,
		secure: Number(SMTP_PORT) === 465,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
	});

	await transporter.sendMail({
		from: SMTP_FROM,
		to: options.to,
		subject: options.subject,
		html: options.html,
	});
}

export function formatContactEmail(
	name: string,
	email: string,
	subject: string,
	message: string
): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">${escapeHtml(name)}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
      </div>
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${escapeHtml(subject)}</div>
      </div>
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">${escapeHtml(message).replace(/\n/g, "<br>")}</div>
      </div>
    </div>
    <div class="footer">
      This message was sent from your contact form.
    </div>
  </div>
</body>
</html>
`;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
