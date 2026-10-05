const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 10_000;
const MAX_TOKEN_LENGTH = 2048;

export type TurnstileAction = "contact" | "login";

type SiteverifyResult = {
	success: boolean;
	action?: string;
	hostname?: string;
	"error-codes"?: string[];
	metadata?: { result_with_testing_key?: boolean };
};

/** Comma-separated frontend hostnames this deployment accepts tokens from. */
function expectedHostnames(): Set<string> {
	return new Set((process.env.TURNSTILE_HOSTNAMES ?? "").split(",").map((h) => h.trim()).filter(Boolean));
}

/**
 * Verifies a Turnstile token with Cloudflare. Fails closed: a missing secret, network error,
 * wrong action or unexpected hostname all return false. Tokens are single-use.
 */
export async function verifyTurnstile(token: unknown, action: TurnstileAction, remoteIp?: string): Promise<boolean> {
	const secret = process.env.TURNSTILE_SECRET;
	const hostnames = expectedHostnames();
	if (!secret || hostnames.size === 0) {
		console.error("Turnstile not configured: set TURNSTILE_SECRET and TURNSTILE_HOSTNAMES");
		return false;
	}
	if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) return false;

	const body = new URLSearchParams({ secret, response: token });
	if (remoteIp) body.set("remoteip", remoteIp);

	let result: SiteverifyResult;
	try {
		const res = await fetch(SITEVERIFY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
			signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
		});
		if (!res.ok) throw new Error(`siteverify ${res.status}`);
		result = (await res.json()) as SiteverifyResult;
	} catch (error) {
		console.error("Turnstile siteverify failed:", error instanceof Error ? error.message : error);
		return false;
	}
	// Cloudflare's public test keys return no action and hostname "example.com".
	// Accept them only where explicitly allowed (local dev), never in production.
	if (result.metadata?.result_with_testing_key) {
		const allowed = process.env.TURNSTILE_ALLOW_TEST_KEYS === "1" && result.success;
		if (!allowed) console.warn("Turnstile test-key result rejected (TURNSTILE_ALLOW_TEST_KEYS not set)");
		return allowed;
	}
	if (!result.success || result.action !== action || !result.hostname || !hostnames.has(result.hostname)) {
		console.warn("Turnstile rejected", { action, got: result.action, hostname: result.hostname, errors: result["error-codes"] });
		return false;
	}
	return true;
}
