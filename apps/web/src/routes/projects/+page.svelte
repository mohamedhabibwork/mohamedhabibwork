<script lang="ts">
	import type { Category, Project } from "@habib-app/api/data";
	import { profile as defaultProfile } from "@habib-app/api/data";
	import Breadcrumbs from "../../components/Breadcrumbs.svelte";
	import Footer from "../../components/Footer.svelte";
	import SEO from "../../components/SEO.svelte";
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

<SEO
	title="Projects - {profile.name} | Portfolio"
	description="Browse {profile.name}'s portfolio of {profile?.stats.projects}+ projects spanning Transportation, Healthcare, FinTech, E-commerce, and more. Full-stack development case studies."
	canonical="/projects"
	ogType="website"
/>

<main class="min-h-screen">
	<div class="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
		<div class="max-w-6xl mx-auto">
			<Breadcrumbs
				items={[
					{ name: "Home", url: "/" },
					{ name: "Projects", url: "" },
				]}
			/>
			<div class="text-center mt-4">
				<h1 class="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
					Projects
				</h1>
				<p class="text-xl max-w-2xl mx-auto text-muted-foreground">
					A comprehensive collection of {profile?.stats.projects}+ projects
					across multiple industries, showcasing expertise in full-stack
					development and team leadership.
				</p>
			</div>
		</div>
	</div>

	<Section class="py-8">
		<div class="flex flex-wrap justify-center gap-2 mb-12">
			{#each categories as category}
				<button
					type="button"
					onclick={() => (activeCategory = category)}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
					class:bg-primary={activeCategory === category}
					class:text-primary-foreground={activeCategory === category}
					class:bg-secondary={activeCategory !== category}
					class:text-secondary-foreground={activeCategory !== category}
				>
					{category}
				</button>
			{/each}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredProjects as project (project.id)}
				<a href="/projects/{project.id}" class="group block">
					<Card class="p-6 flex flex-col h-full card-lift">
						<div class="flex items-start justify-between mb-3">
							<Badge>{project.category}</Badge>
							<span class="text-xs text-muted-foreground">{project.year}</span>
						</div>
						<h3
							class="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors"
						>
							{project.title}
						</h3>
						<p class="text-sm mb-4 flex-grow text-muted-foreground">
							{project.description}
						</p>

						<div class="space-y-3">
							<div>
								<p class="text-xs mb-2 text-muted-foreground">Key Features:</p>
								<ul class="space-y-1">
									{#each project.features.slice(0, 3) as feature}
										<li
											class="text-xs flex items-start gap-2 text-muted-foreground"
										>
											<span class="text-primary">•</span>
											{feature}
										</li>
									{/each}
								</ul>
							</div>

							<div class="flex flex-wrap gap-2 pt-2 border-t border-border">
								{#each project.techStack.slice(0, 4) as tech}
									<span
										class="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground border border-border"
									>
										{tech}
									</span>
								{/each}
								{#if project.techStack.length > 4}
									<span
										class="px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
									>
										+{project.techStack.length - 4}
										more
									</span>
								{/if}
							</div>
						</div>

						<div
							class="mt-4 text-sm text-primary font-medium group-hover:underline"
						>
							View Details →
						</div>
					</Card>
				</a>
			{/each}
		</div>

		{#if filteredProjects.length === 0}
			<div class="text-center py-12">
				<p class="text-muted-foreground">No projects found in this category.</p>
			</div>
		{/if}
	</Section>

	<div class="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-2xl font-bold mb-4 text-foreground">
				Interested in working together?
			</h2>
			<p class="mb-8 text-muted-foreground">
				Let's discuss your next project and how I can help bring your ideas to
				life.
			</p>
			<a
				href="/contact"
				class="inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors bg-primary text-primary-foreground hover:opacity-90"
			>
				Contact Me
			</a>
		</div>
	</div>

	<Footer {profile} />
</main>
