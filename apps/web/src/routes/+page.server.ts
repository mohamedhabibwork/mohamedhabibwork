import { experience } from "$lib/data/experience";
import { profile } from "$lib/data/profile";
import { projects } from "$lib/data/projects";
import { skills } from "$lib/data/skills";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({
	profile,
	skills,
	featuredProjects: projects.slice(0, 6),
	experience: experience.slice(0, 5),
});
