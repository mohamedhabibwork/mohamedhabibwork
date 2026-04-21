import { categories, projects } from "$lib/data/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({
	projects,
	categories,
});
