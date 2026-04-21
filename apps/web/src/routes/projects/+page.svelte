<script lang="ts">
	import type { Category, Project } from "@habib-app/api/data";
	import { profile as defaultProfile } from "@habib-app/api/data";
	import Footer from "../../components/Footer.svelte";
	import Badge from "../../components/ui/Badge.svelte";
	import Card from "../../components/ui/Card.svelte";
	import Section from "../../components/ui/Section.svelte";
	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();

	const projects = $derived(data.projects?.projects ?? []);
	const categories = $derived(data.projects?.categories ?? ["All"]);
	const profile = $derived(data.profile ?? defaultProfile);

	let activeCategory = $state<Category>("All");

	const filteredProjects = $derived(
		activeCategory === "All"
			? projects
			: projects.filter((p: Project) => p.category === activeCategory)
	);
</script>

<svelte:head>
	<title>Projects - {profile.name}</title>
	<meta
		name="description"
		content="Browse {profile.name}'s portfolio of {profile.stats.projects}+ projects spanning Transportation, Healthcare, FinTech, E-commerce, and more."
	>
</svelte:head>

<main class="min-h-screen">
	<div class="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
		<div class="max-w-6xl mx-auto text-center">
			<h1
				class="text-4xl sm:text-5xl font-bold mb-4"
				style="color: var(--text-primary);"
			>
				Projects
			</h1>
			<p
				class="text-xl max-w-2xl mx-auto"
				style="color: var(--text-secondary);"
			>
				A comprehensive collection of {profile.stats.projects}+ projects across
				multiple industries, showcasing expertise in full-stack development and
				team leadership.
			</p>
		</div>
	</div>

	<Section class="py-8">
		<div class="flex flex-wrap justify-center gap-2 mb-12">
			{#each categories as category}
				<button
					type="button"
					onclick={() => (activeCategory = category)}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
					style={activeCategory === category
						? "background-color: var(--accent); color: #ffffff;"
						: "background-color: var(--bg-secondary); color: var(--text-secondary);"}
					onmouseenter={(e) => {
						if (activeCategory !== category) {
							e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
							e.currentTarget.style.color = "var(--text-primary)";
						}
					}}
					onmouseleave={(e) => {
						if (activeCategory !== category) {
							e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
							e.currentTarget.style.color = "var(--text-secondary)";
						}
					}}
				>
					{category}
				</button>
			{/each}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredProjects as project (project.id)}
				<Card class="p-6 flex flex-col h-full">
					<div class="flex items-start justify-between mb-3">
						<Badge>{project.category}</Badge>
						<span class="text-xs" style="color: var(--text-muted);"
							>{project.year}</span
						>
					</div>
					<h3
						class="text-xl font-semibold mb-3"
						style="color: var(--text-primary);"
					>
						{project.title}
					</h3>
					<p
						class="text-sm mb-4 flex-grow"
						style="color: var(--text-secondary);"
					>
						{project.description}
					</p>

					<div class="space-y-3">
						<div>
							<p class="text-xs mb-2" style="color: var(--text-muted);">
								Key Features:
							</p>
							<ul class="space-y-1">
								{#each project.features.slice(0, 3) as feature}
									<li
										class="text-xs flex items-start gap-2"
										style="color: var(--text-secondary);"
									>
										<span style="color: var(--accent);">•</span>
										{feature}
									</li>
								{/each}
							</ul>
						</div>

						<div
							class="flex flex-wrap gap-2 pt-2"
							style="border-top: 1px solid var(--border-color);"
						>
							{#each project.techStack as tech}
								<span
									class="px-2 py-1 text-xs rounded"
									style="background-color: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-color);"
								>
									{tech}
								</span>
							{/each}
						</div>
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

		{#if filteredProjects.length === 0}
			<div class="text-center py-12">
				<p style="color: var(--text-muted);">
					No projects found in this category.
				</p>
			</div>
		{/if}
	</Section>

	<div
		class="py-16 px-4 sm:px-6 lg:px-8"
		style="border-top: 1px solid var(--border-color);"
	>
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">
				Interested in working together?
			</h2>
			<p class="mb-8" style="color: var(--text-secondary);">
				Let's discuss your next project and how I can help bring your ideas to
				life.
			</p>
			<a
				href="/contact"
				class="inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors"
				style="background-color: var(--accent); color: #ffffff;"
				onmouseenter={(e) => {
					e.currentTarget.style.opacity = "0.9";
				}}
				onmouseleave={(e) => {
					e.currentTarget.style.opacity = "1";
				}}
			>
				Contact Me
			</a>
		</div>
	</div>

	<Footer {profile} />
</main>
