import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, Button, Input, Logo, MarkArt, ThemeToggle } from "#/design-system/ui";
import { getSession, signIn } from "#/server/fn/auth";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		if ((await getSession()).signedIn) throw redirect({ to: "/admin" });
	},
	head: () => ({ meta: [{ title: "Sign in · mohamedhabib.work" }, { name: "robots", content: "noindex" }] }),
	component: Login,
});

function Login() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		setBusy(true);
		setError("");
		try {
			const res = await signIn({ data: { email: String(fd.get("email")), password: String(fd.get("password")) } });
			if (!res.ok) setError(res.error);
			else await router.navigate({ to: "/admin" });
		} catch {
			setError("Enter a valid email and your password.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<main id="main" style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 16 }}>
			<div className="mh-auth" style={{ width: "min(920px, 100%)" }}>
				<div className="mh-auth__art">
					<Logo size={30} />
					<p className="mh-auth__quote">Build calm systems. Ship often.</p>
					<MarkArt className="mh-auth__shape" fill="var(--lime-500)" />
				</div>
				<form className="mh-auth__form" onSubmit={onSubmit}>
					<div className="mh-row mh-row--between">
						<h1 className="mh-auth__title">Sign in</h1>
						<ThemeToggle />
					</div>
					<p className="mh-auth__sub">Dashboard for mohamedhabib.work</p>
					{error && <Alert variant="danger" title="Couldn't sign in">{error}</Alert>}
					<Input name="email" type="email" label="Email" leadingIcon="mail" autoComplete="username" required />
					<Input name="password" type="password" label="Password" autoComplete="current-password" required />
					<Button type="submit" size="lg" block loading={busy}>Sign in</Button>
					<a className="mh-link" href="/" style={{ fontSize: 14 }}>← Back to the site</a>
				</form>
			</div>
		</main>
	);
}
