import { serverClient } from "$lib/orpc.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const [profile, skills, experience] = await Promise.all([
		serverClient.profile(),
		serverClient.skills(),
		serverClient.experience(),
	]);

	return {
		profile,
		skills,
		experience,
	};
};
