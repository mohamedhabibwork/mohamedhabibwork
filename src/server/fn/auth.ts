import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminCredentials, createSession, destroySession, isSignedIn, verifyPassword } from "#/server/auth";

export const getSession = createServerFn({ method: "GET" }).handler(async () => ({ signedIn: await isSignedIn() }));

export const signIn = createServerFn({ method: "POST" })
	.validator((input: unknown) => z.object({ email: z.string().trim().email(), password: z.string().min(1).max(200) }).parse(input))
	.handler(async ({ data }) => {
		const admin = adminCredentials();
		const ok = data.email.toLowerCase() === admin.email && (await verifyPassword(data.password, admin.passwordHash));
		if (!ok) {
			// Same message and similar timing for a wrong email or password.
			await new Promise((r) => setTimeout(r, 400));
			return { ok: false as const, error: "Email or password is incorrect." };
		}
		await createSession();
		return { ok: true as const };
	});

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
	await destroySession();
	return { ok: true as const };
});
