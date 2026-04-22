import { error } from "@sveltejs/kit";
import { serverClient } from "$lib/orpc.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const [profile, project] = await Promise.all([
		serverClient.profile(),
		serverClient.projectsCrud.get({ projectId: params.projectId }),
	]);

	if (!project) {
		error(404, "Project not found");
	}

	return {
		profile,
		project,
	};
};
