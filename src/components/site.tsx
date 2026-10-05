import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Turnstile, type TurnstileHandle } from "#/components/Turnstile";
import { Alert, Button, Icon, Input, LinkButton, Logo, Select, Textarea, ThemeToggle } from "#/design-system/ui";
import { sendMessage } from "#/server/fn/public";

const NAV = [
	{ to: "/projects", label: "Projects" },
	{ to: "/services", label: "Services" },
	{ to: "/", hash: "experience", label: "Experience" },
	{ to: "/", hash: "contact", label: "Contact" },
] as const;

export function SiteHeader() {
	return (
		<header className="site-header">
			<div className="site site-header__inner">
				<Logo size={26} href="/" />
				<nav className="site-nav" aria-label="Main">
					{NAV.map((n) => (
						<Link key={n.label} to={n.to} hash={"hash" in n ? n.hash : undefined} activeOptions={{ exact: true, includeHash: true }} activeProps={{ "aria-current": "page" }}>
							{n.label}
						</Link>
					))}
				</nav>
				<ThemeToggle />
				<LinkButton href="/#contact" size="sm">Hire me</LinkButton>
			</div>
		</header>
	);
}

type Owner = { name: string; email: string; github: string; linkedin: string };

export function SiteFooter({ owner }: { owner?: Owner | null }) {
	return (
		<footer className="site" style={{ marginTop: 72 }}>
			<div className="mh-footer">
				<div className="mh-footer__bottom" style={{ borderTop: 0, paddingTop: 0 }}>
					<span>© {new Date().getFullYear()} {owner?.name ?? "Mohamed Habib"}</span>
					<span className="mh-row" style={{ gap: 4 }}>
						{owner?.github && <a className="mh-iconbtn" href={owner.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer"><Icon name="github" /></a>}
						{owner?.linkedin && <a className="mh-iconbtn" href={owner.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Icon name="linkedin" /></a>}
						{owner?.email && <a className="mh-iconbtn" href={`mailto:${owner.email}`} aria-label="Email"><Icon name="mail" /></a>}
					</span>
				</div>
			</div>
		</footer>
	);
}

type ServiceOption = { slug: string; title: string };

/**
 * Contact form. With `service` the enquiry is tagged with that service;
 * with `services` the visitor can pick one. Messages are saved and emailed to the owner.
 */
export function ContactForm({ service, services }: { service?: ServiceOption; services?: ServiceOption[] }) {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState("");
	const [token, setToken] = useState("");
	const turnstile = useRef<TurnstileHandle>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget;
		if (!token) {
			setFormError("Please complete the verification below.");
			return;
		}
		const input = { ...Object.fromEntries(new FormData(form).entries()), "cf-turnstile-response": token };
		setState("sending");
		setErrors({});
		setFormError("");
		try {
			const res = await sendMessage({ data: input });
			if (!res.ok) {
				setState("idle");
				setFormError(res.error);
				return;
			}
			setState("sent");
			form.reset();
		} catch (err) {
			setState("idle");
			const issues = parseIssues(err);
			if (issues) setErrors(issues);
			else setFormError("Couldn't send your message. Please email me directly instead.");
		} finally {
			// Tokens are single-use: get a fresh one for any further submit.
			turnstile.current?.reset();
		}
	}

	return (
		<form className="mh-card form-grid" method="post" onSubmit={onSubmit} noValidate>
			{state === "sent" && <Alert variant="success" title="Message sent">Thanks! I'll reply within a day.</Alert>}
			{formError && <Alert variant="danger" title="Not sent">{formError}</Alert>}
			{service && <input type="hidden" name="service" value={service.slug} />}
			{!service && services && services.length > 0 && (
				<Select name="service" label="Service (optional)" defaultValue="" options={[{ value: "", label: "General enquiry" }, ...services.map((s) => ({ value: s.slug, label: s.title }))]} error={errors.service} />
			)}
			<div className="form-grid-2">
				<Input name="name" label="Name" required autoComplete="name" error={errors.name} />
				<Input name="email" type="email" label="Email" required autoComplete="email" error={errors.email} />
			</div>
			<Input name="subject" label="Subject" defaultValue={service ? `Enquiry: ${service.title}` : undefined} error={errors.subject} />
			<Textarea name="body" label={service ? "Tell me about your project" : "Message"} required rows={5} error={errors.body} />
			<div className="hp" aria-hidden>
				<label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
			</div>
			<Turnstile ref={turnstile} action="contact" onToken={setToken} />
			<div><Button type="submit" loading={state === "sending"} disabled={!token} trailingIcon="send">Send message</Button></div>
		</form>
	);
}

/** Maps a zod validation error from a server function to field messages. */
function parseIssues(err: unknown): Record<string, string> | null {
	try {
		const msg = err instanceof Error ? err.message : String(err);
		const issues = JSON.parse(msg) as { path: (string | number)[]; message: string }[];
		if (!Array.isArray(issues)) return null;
		return Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]));
	} catch {
		return null;
	}
}
