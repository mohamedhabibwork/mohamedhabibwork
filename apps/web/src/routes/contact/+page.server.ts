import type { PageServerLoad } from "./$types";
import { serverClient } from "$lib/orpc.server";

export const load: PageServerLoad = async () => {
	const profile = await serverClient.profile();

	return {
		profile,
	};
};
