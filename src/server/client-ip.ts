import { getRequestHeader } from "@tanstack/react-start/server";

/** Client IP behind the reverse proxy: Traefik sets X-Forwarded-For; the first hop is the client. */
export function clientIp(): string | undefined {
	const forwarded = getRequestHeader("x-forwarded-for");
	return forwarded?.split(",")[0]?.trim() || getRequestHeader("x-real-ip") || undefined;
}
