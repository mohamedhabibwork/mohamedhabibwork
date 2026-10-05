import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { eq, lt } from "drizzle-orm";
import { withDb } from "#/db";
import { sessions } from "#/db/schema";

const COOKIE = "mh_session";
const SESSION_DAYS = 14;
const PBKDF2_ITERATIONS = 100_000;

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer | Uint8Array) =>
	[...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex: string): Uint8Array<ArrayBuffer> => new Uint8Array(hex.match(/.{2}/g)?.map((h) => Number.parseInt(h, 16)) ?? []);

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
	const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
	const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
	return toHex(bits);
}

/** Produces `pbkdf2:<iterations>:<saltHex>:<hashHex>` for ADMIN_PASSWORD_HASH (no `$`, so env loaders can't expand it). */
export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	return `pbkdf2:${PBKDF2_ITERATIONS}:${toHex(salt)}:${await pbkdf2(password, salt, PBKDF2_ITERATIONS)}`;
}

export function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [scheme, iter, saltHex, hashHex] = stored.split(":");
	if (scheme !== "pbkdf2" || !iter || !saltHex || !hashHex) return false;
	const actual = await pbkdf2(password, fromHex(saltHex), Number(iter));
	return timingSafeEqual(actual, hashHex);
}

export function adminCredentials(): { email: string; passwordHash: string } {
	const email = process.env.ADMIN_EMAIL || "admin@mohamedhabib.work";
	const passwordHash = process.env.ADMIN_PASSWORD_HASH || "pbkdf2:100000:<salt>:<hash>";
	if (!email || !passwordHash) {
		throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be set (see .env.example)");
	}
	return { email: email.toLowerCase(), passwordHash };
}

function isSecureRequest(): boolean {
	return process.env.NODE_ENV === "production";
}

export async function createSession(): Promise<void> {
	const id = toHex(crypto.getRandomValues(new Uint8Array(32)));
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
	await withDb(async (db) => {
		await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
		await db.insert(sessions).values({ id, expiresAt });
	});
	setCookie(COOKIE, id, {
		httpOnly: true,
		sameSite: "lax",
		secure: isSecureRequest(),
		path: "/",
		expires: expiresAt,
	});
}

export async function destroySession(): Promise<void> {
	const id = getCookie(COOKIE);
	if (id) await withDb((db) => db.delete(sessions).where(eq(sessions.id, id)));
	deleteCookie(COOKIE, { path: "/" });
}

/** True when the current request carries a live owner session. */
export async function isSignedIn(): Promise<boolean> {
	const id = getCookie(COOKIE);
	if (!id || !/^[0-9a-f]{64}$/.test(id)) return false;
	const row = await withDb((db) => db.query.sessions.findFirst({ where: eq(sessions.id, id) }));
	return Boolean(row && row.expiresAt > new Date());
}

export async function requireOwner(): Promise<void> {
	if (!(await isSignedIn())) throw new Error("UNAUTHORIZED");
}
