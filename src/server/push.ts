import { inArray } from "drizzle-orm";
import { withDb } from "#/db";
import { pushTokens } from "#/db/schema";

/**
 * Admin push notifications through the Firebase Cloud Messaging HTTP v1 API.
 * Needs the FIREBASE_SERVICE_ACCOUNT secret: the service-account JSON key from
 * Firebase console → Project settings → Service accounts → Generate new private key.
 */

type ServiceAccount = {
	project_id: string;
	client_email: string;
	private_key: string;
};

export type PushNotice = {
	title: string;
	body: string /** Same-site path opened on click. */;
	url: string;
};

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
/** Google access tokens last an hour; renew a little early. */
const TOKEN_TTL_S = 3600;
const RENEW_MARGIN_MS = 5 * 60_000;

let cachedAccess: { token: string; expiresAt: number } | null = null;

function serviceAccount(): ServiceAccount | null {
	const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
	if (!raw) return null;
	try {
		const sa = JSON.parse(raw) as Partial<ServiceAccount>;
		return sa.project_id && sa.client_email && sa.private_key
			? (sa as ServiceAccount)
			: null;
	} catch {
		console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
		return null;
	}
}

export const isPushConfigured = () => serviceAccount() !== null;

const b64url = (data: ArrayBuffer | string) =>
	btoa(
		typeof data === "string"
			? data
			: String.fromCharCode(...new Uint8Array(data)),
	)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

async function signJwt(sa: ServiceAccount): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const claims = b64url(
		JSON.stringify({
			iss: sa.client_email,
			scope: FCM_SCOPE,
			aud: TOKEN_URL,
			iat: now,
			exp: now + TOKEN_TTL_S,
		}),
	);
	const pem = sa.private_key.replace(/-----[^-]+-----|\s/g, "");
	const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
	const key = await crypto.subtle.importKey(
		"pkcs8",
		der,
		{ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"RSASSA-PKCS1-v1_5",
		key,
		new TextEncoder().encode(`${header}.${claims}`),
	);
	return `${header}.${claims}.${b64url(signature)}`;
}

async function accessToken(sa: ServiceAccount): Promise<string> {
	if (cachedAccess && cachedAccess.expiresAt - RENEW_MARGIN_MS > Date.now())
		return cachedAccess.token;
	const res = await fetch(TOKEN_URL, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: await signJwt(sa),
		}),
	});
	if (!res.ok)
		throw new Error(`Google OAuth token request failed (${res.status})`);
	const data = (await res.json()) as {
		access_token: string;
		expires_in: number;
	};
	cachedAccess = {
		token: data.access_token,
		expiresAt: Date.now() + data.expires_in * 1000,
	};
	return data.access_token;
}

/** FCM error codes meaning the token will never work again. */
const DEAD_TOKEN = /UNREGISTERED|NOT_FOUND|INVALID_ARGUMENT/;

async function sendOne(
	sa: ServiceAccount,
	access: string,
	token: string,
	n: PushNotice,
): Promise<"ok" | "dead" | "failed"> {
	const res = await fetch(
		`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
		{
			method: "POST",
			headers: {
				authorization: `Bearer ${access}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				message: {
					token,
					// Data-only, so the service worker builds the notification and controls the click target.
					data: {
						title: n.title.slice(0, 120),
						body: n.body.slice(0, 400),
						url: n.url,
					},
					webpush: { headers: { Urgency: "high", TTL: "86400" } },
				},
			}),
		},
	);
	if (res.ok) return "ok";
	const text = await res.text();
	if (res.status === 404 || DEAD_TOKEN.test(text)) return "dead";
	console.error(`FCM send failed (${res.status}): ${text.slice(0, 300)}`);
	return "failed";
}

/**
 * Pushes a notice to every registered admin browser and drops tokens FCM reports as gone.
 * Never throws: callers have already saved their data, so a push failure is only logged.
 * Returns how many browsers received it.
 */
export async function notifyOwnerPush(n: PushNotice): Promise<number> {
	const sa = serviceAccount();
	if (!sa) return 0;
	try {
		const tokens = await withDb((db) =>
			db.select({ token: pushTokens.token }).from(pushTokens),
		);
		if (tokens.length === 0) return 0;
		const access = await accessToken(sa);
		const results = await Promise.all(
			tokens.map(({ token }) => sendOne(sa, access, token, n)),
		);
		const dead = tokens
			.filter((_, i) => results[i] === "dead")
			.map((t) => t.token);
		if (dead.length)
			await withDb((db) =>
				db.delete(pushTokens).where(inArray(pushTokens.token, dead)),
			);
		return results.filter((r) => r === "ok").length;
	} catch (error) {
		console.error(
			"Push notification failed:",
			error instanceof Error ? error.message : error,
		);
		return 0;
	}
}
