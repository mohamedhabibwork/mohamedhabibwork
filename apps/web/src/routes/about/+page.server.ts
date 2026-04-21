import { experience } from "$lib/data/experience";
import { profile } from "$lib/data/profile";
import { skills } from "$lib/data/skills";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({
	profile,
	skills,
	experience,
});
