import type { PageServerLoad } from "./$types";
import { serverClient } from "$lib/orpc.server";

export const load: PageServerLoad = async () => {
	const [profile, projects] = await Promise.all([
		serverClient.profile(),
		serverClient.projects(),
	]);

	return {
		profile,
		projects,
	};
};
