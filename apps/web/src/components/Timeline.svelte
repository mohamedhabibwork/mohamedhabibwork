<script lang="ts">
	import type { ExperienceEntry } from "@habib-app/api/data";
	import Card from "./ui/Card.svelte";
	import Section from "./ui/Section.svelte";

	interface Props {
		experience: readonly ExperienceEntry[];
	}

	const { experience }: Props = $props();
</script>

<Section id="timeline" class="py-24 sm:py-32">
	<div class="text-center mb-16">
		<h2 class="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
			Professional Journey
		</h2>
		<p class="max-w-2xl mx-auto text-muted-foreground">
			My career path and the experiences that shaped my expertise
		</p>
	</div>

	<div class="relative max-w-4xl mx-auto">
		<div
			class="absolute left-0 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border"
		></div>

		<div class="space-y-12">
			{#each experience as entry, index}
				<div
					class="relative flex flex-col md:flex-row gap-8 {index % 2 === 0
						? 'md:flex-row-reverse'
						: ''}"
				>
					<div
						class="absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 border-4 border-background"
						class:bg-primary={entry.current}
						class:bg-muted-foreground={!entry.current}
					></div>

					<Card class="ml-8 md:ml-0 md:w-[calc(50%-2rem)] p-6">
						<div class="flex items-center gap-2 mb-1">
							<span class="text-sm font-medium text-primary">
								{entry.period}
							</span>
							{#if entry.current}
								<span
									class="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent"
									>Current</span
								>
							{/if}
						</div>
						<h3 class="text-xl font-semibold mb-1 text-card-foreground">
							{entry.role}
						</h3>
						<div class="text-muted-foreground">{entry.company}</div>
						<p class="text-sm mb-4 text-muted-foreground">
							{entry.description}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each entry.tech as tech}
								<span
									class="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground border border-border"
								>
									{tech}
								</span>
							{/each}
						</div>
					</Card>

					<div class="hidden md:block md:w-[calc(50%-2rem)]"></div>
				</div>
			{/each}
		</div>
	</div>
</Section>
