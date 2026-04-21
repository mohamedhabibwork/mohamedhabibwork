<script lang="ts">
	import type { Profile } from "$lib/data/profile";
	import Card from "./ui/Card.svelte";
	import Section from "./ui/Section.svelte";

	interface Props {
		bio: string;
		location?: string;
		stats: Profile["stats"];
	}

	const { bio, stats, location }: Props = $props();
</script>

<Section id="about" class="py-24 sm:py-32">
	<div class="text-center mb-16">
		<h2
			class="text-3xl sm:text-4xl font-bold mb-4"
			style="color: var(--text-primary);"
		>
			About Me
		</h2>
		<p class="max-w-2xl mx-auto" style="color: var(--text-secondary);">{bio}</p>
		{#if location}
			<p class="text-sm mt-2" style="color: var(--text-muted);">
				📍 {location}
			</p>
		{/if}
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
		<Card class="p-6 text-center">
			<div class="text-4xl font-bold mb-2" style="color: var(--accent);">
				{stats.years}+
			</div>
			<div style="color: var(--text-secondary);">Years of Experience</div>
			<p class="text-sm mt-2" style="color: var(--text-muted);">
				Building scalable solutions and leading teams to success
			</p>
		</Card>

		<Card class="p-6 text-center">
			<div class="text-4xl font-bold mb-2" style="color: var(--accent);">
				{stats.projects}+
			</div>
			<div style="color: var(--text-secondary);">Projects Completed</div>
			<p class="text-sm mt-2" style="color: var(--text-muted);">
				From startups to enterprise-level applications
			</p>
		</Card>

		<Card class="p-6 text-center">
			<div class="text-4xl font-bold mb-2" style="color: var(--accent);">
				{stats.successRate}%
			</div>
			<div style="color: var(--text-secondary);">Success Rate</div>
			<p class="text-sm mt-2" style="color: var(--text-muted);">
				Delivering on promises and exceeding expectations
			</p>
		</Card>
	</div>
</Section>
