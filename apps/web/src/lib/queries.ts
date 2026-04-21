import { createMutation } from "@tanstack/svelte-query";
import { orpc } from "./orpc";

export function useContactMutation() {
	return createMutation(orpc.contact.mutationOptions());
}
