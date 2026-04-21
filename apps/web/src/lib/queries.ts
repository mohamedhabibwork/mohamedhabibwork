import { createMutation, createQuery } from "@tanstack/svelte-query";
import { orpc } from "./orpc";

export function useProfileQuery() {
	return createQuery(orpc.profile.queryOptions());
}

export function useSkillsQuery() {
	return createQuery(orpc.skills.queryOptions());
}

export function useProjectsQuery() {
	return createQuery(orpc.projects.queryOptions());
}

export function useExperienceQuery() {
	return createQuery(orpc.experience.queryOptions());
}

export function useIndustriesQuery() {
	return createQuery(orpc.industries.queryOptions());
}

export function useContactMutation() {
	return createMutation(orpc.contact.mutationOptions());
}
