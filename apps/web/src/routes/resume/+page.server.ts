import { serverClient } from "$lib/orpc.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const resumeData = await serverClient.resume.generate();

	return {
		resume: resumeData,
	};
};
