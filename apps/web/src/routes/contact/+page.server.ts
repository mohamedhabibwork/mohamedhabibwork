import { serverClient } from "$lib/orpc.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const profile = await serverClient.profile();

	return {
		profile,
	};
};
