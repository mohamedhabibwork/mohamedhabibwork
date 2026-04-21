<script lang="ts">
	import type { Project } from "@habib-app/api/data";
	import Badge from "./ui/Badge.svelte";
	import Card from "./ui/Card.svelte";
	import Section from "./ui/Section.svelte";

	interface Props {
		projects: readonly Project[];
		showAll?: boolean;
	}

	const { projects, showAll = false }: Props = $props();

	const displayProjects = $derived(showAll ? projects : projects.slice(0, 6));
</script>

<Section id="projects" class="py-24 sm:py-32">
	<div class="text-center mb-16">
		<h2
			class="text-3xl sm:text-4xl font-bold mb-4"
			style="color: var(--text-primary);"
		>
			Featured Projects
		</h2>
		<p class="max-w-2xl mx-auto" style="color: var(--text-secondary);">
			A selection of projects that showcase my expertise in building scalable,
			user-friendly applications
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each displayProjects as project (project.id)}
			<Card class="p-6 flex flex-col h-full">
				<Badge class="self-start mb-3">{project.category}</Badge>
				<h3
					class="text-xl font-semibold mb-3"
					style="color: var(--text-primary);"
				>
					{project.title}
				</h3>
				<p class="text-sm mb-4 flex-grow" style="color: var(--text-secondary);">
					{project.description}
				</p>
				<div class="flex flex-wrap gap-2 mt-auto">
					{#each project.techStack as tech}
						<span
							class="px-2 py-1 text-xs rounded"
							style="background-color: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-color);"
						>
							{tech}
						</span>
					{/each}
				</div>
				{#if project.url}
					<a
						href={project.url}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-4 text-sm transition-colors hover:opacity-80"
						style="color: var(--accent);"
					>
						Visit → {project.url}
					</a>
				{/if}
			</Card>
		{/each}
	</div>
</Section>
