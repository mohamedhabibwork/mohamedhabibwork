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
		<h2
			class="text-3xl sm:text-4xl font-bold mb-4"
			style="color: var(--text-primary);"
		>
			Professional Journey
		</h2>
		<p class="max-w-2xl mx-auto" style="color: var(--text-secondary);">
			My career path and the experiences that shaped my expertise
		</p>
	</div>

	<div class="relative max-w-4xl mx-auto">
		<div
			class="absolute left-0 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
			style="background-color: var(--border-color);"
		></div>

		<div class="space-y-12">
			{#each experience as entry, index}
				<div
					class="relative flex flex-col md:flex-row gap-8 {index % 2 === 0
						? 'md:flex-row-reverse'
						: ''}"
				>
					<div
						class="absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 border-4"
						style="border-color: var(--bg-primary);"
						class:bg-green-500={entry.current}
						class:bg-blue-600={!entry.current}
					></div>

					<Card class="ml-8 md:ml-0 md:w-[calc(50%-2rem)] p-6">
						<div class="flex items-center gap-2 mb-1">
							<span class="text-sm font-medium" style="color: var(--accent);"
								>{entry.period}</span
							>
							{#if entry.current}
								<span
									class="px-2 py-0.5 text-xs rounded-full"
									style="background-color: rgba(34, 197, 94, 0.2); color: var(--text-primary);"
									>Current</span
								>
							{/if}
						</div>
						<h3
							class="text-xl font-semibold mb-1"
							style="color: var(--text-primary);"
						>
							{entry.role}
						</h3>
						<div style="color: var(--text-secondary);">{entry.company}</div>
						<p class="text-sm mb-4" style="color: var(--text-muted);">
							{entry.description}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each entry.tech as tech}
								<span
									class="px-2 py-1 text-xs rounded"
									style="background-color: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-color);"
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
