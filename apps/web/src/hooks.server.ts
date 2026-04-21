import "$lib/orpc.server";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => resolve(event);
