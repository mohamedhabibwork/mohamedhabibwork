import { useEffect, useRef, useState } from "react";
import { Turnstile, type TurnstileHandle } from "#/components/Turnstile";
import { Alert, Button, Input, Select, Textarea } from "#/design-system/ui";
import { track } from "#/lib/analytics";
import { sendMessage } from "#/server/fn/public";

type ServiceOption = { slug: string; title: string };

/**
 * Contact form. With `service` the enquiry is tagged with that service;
 * with `services` the visitor can pick one. Messages are saved and emailed to the owner.
 */
export function ContactForm({
	service,
	services,
}: {
	service?: ServiceOption;
	services?: ServiceOption[];
}) {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState("");
	const [token, setToken] = useState("");
	const turnstile = useRef<TurnstileHandle>(null);
	const statusRef = useRef<HTMLDivElement>(null);
	const hasFieldErrors = Object.keys(errors).length > 0;

	// Bring the outcome into view: the form is tall and the visitor is at the button.
	useEffect(() => {
		if (state === "sent" || formError || hasFieldErrors)
			statusRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
	}, [state, formError, hasFieldErrors]);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget;
		if (!token) {
			setFormError("Please complete the verification below.");
			return;
		}
		const input = {
			...Object.fromEntries(new FormData(form).entries()),
			"cf-turnstile-response": token,
		};
		setState("sending");
		setErrors({});
		setFormError("");
		try {
			const res = await sendMessage({ data: input });
			if (!res.ok) {
				setState("idle");
				setFormError(res.error);
				track("form_error", { form: "contact" });
				return;
			}
			setState("sent");
			track("generate_lead", {
				form: "contact",
				service: String(new FormData(form).get("service") ?? ""),
			});
			form.reset();
		} catch (err) {
			setState("idle");
			track("form_error", { form: "contact" });
			const issues = parseIssues(err);
			if (!issues) {
				setFormError(
					"Couldn't send your message. Please email me directly instead.",
				);
				return;
			}
			const fieldErrors = Object.fromEntries(
				Object.entries(issues).filter(([key]) => FORM_FIELDS.has(key)),
			);
			setErrors(fieldErrors);
			// Issues without a visible field would otherwise leave the visitor with nothing highlighted.
			if (Object.keys(fieldErrors).length < Object.keys(issues).length)
				setFormError(
					"Something in the form didn't check out. Please refresh the page and try again.",
				);
		} finally {
			// Tokens are single-use: get a fresh one for any further submit.
			turnstile.current?.reset();
		}
	}

	return (
		<form
			className="mh-card form-grid"
			method="post"
			onSubmit={onSubmit}
			noValidate
		>
			{service && <input type="hidden" name="service" value={service.slug} />}
			{!service && services && services.length > 0 && (
				<Select
					name="service"
					label="Service (optional)"
					defaultValue=""
					options={[
						{ value: "", label: "General enquiry" },
						...services.map((s) => ({ value: s.slug, label: s.title })),
					]}
					error={errors.service}
				/>
			)}
			<div className="form-grid-2">
				<Input
					name="name"
					label="Name"
					required
					autoComplete="name"
					error={errors.name}
				/>
				<Input
					name="email"
					type="email"
					label="Email"
					required
					autoComplete="email"
					error={errors.email}
				/>
			</div>
			<Input
				name="subject"
				label="Subject"
				defaultValue={service ? `Enquiry: ${service.title}` : undefined}
				error={errors.subject}
			/>
			<Textarea
				name="body"
				label={service ? "Tell me about your project" : "Message"}
				required
				rows={5}
				error={errors.body}
			/>
			<div className="hp" aria-hidden>
				<label>
					Leave this field empty
					<input name="hp_check" tabIndex={-1} autoComplete="off" />
				</label>
			</div>
			<Turnstile ref={turnstile} action="contact" onToken={setToken} />
			<div>
				<Button
					type="submit"
					loading={state === "sending"}
					disabled={!token}
					trailingIcon="send"
				>
					Send message
				</Button>
			</div>
			<div ref={statusRef} aria-live="polite">
				{state === "sent" && (
					<Alert variant="success" title="Message sent">
						Thanks! I'll reply within a day.
					</Alert>
				)}
				{formError && (
					<Alert variant="danger" title="Not sent">
						{formError}
					</Alert>
				)}
				{hasFieldErrors && !formError && (
					<Alert variant="danger" title="Not sent">
						Please fix the highlighted fields above.
					</Alert>
				)}
			</div>
		</form>
	);
}

/** Fields that have a visible error message in the form. */
const FORM_FIELDS = new Set(["name", "email", "subject", "service", "body"]);

/** Maps a zod validation error from a server function to field messages. */
function parseIssues(err: unknown): Record<string, string> | null {
	try {
		const msg = err instanceof Error ? err.message : String(err);
		const issues = JSON.parse(msg) as {
			path: (string | number)[];
			message: string;
		}[];
		if (!Array.isArray(issues)) return null;
		return Object.fromEntries(
			issues.map((i) => [String(i.path[0]), i.message]),
		);
	} catch {
		return null;
	}
}
