import { serverClient } from "$lib/orpc.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const [profile, skills, projects, experience] = await Promise.all([
		serverClient.profile(),
		serverClient.skills(),
		serverClient.projects(),
		serverClient.experience(),
	]);

	return {
		profile,
		skills,
		projects,
		experience,
	};
};
