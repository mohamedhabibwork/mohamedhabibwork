import { profile } from "$lib/data/profile";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({
	profile,
});
