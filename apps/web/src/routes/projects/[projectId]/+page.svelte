<script lang="ts">
	import Breadcrumbs from "../../../components/Breadcrumbs.svelte";
	import Footer from "../../../components/Footer.svelte";
	import ProjectStructuredData from "../../../components/ProjectStructuredData.svelte";
	import SEO from "../../../components/SEO.svelte";
	import Badge from "../../../components/ui/Badge.svelte";
	import Button from "../../../components/ui/Button.svelte";
	import Card from "../../../components/ui/Card.svelte";
	import Section from "../../../components/ui/Section.svelte";
	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();

	const profile = $derived(
		data.profile ?? {
			name: "Mohamed Habib",
			email: "",
			whatsapp: "",
			linkedin: "",
			location: "",
		}
	);

	const project = $derived(data.project);
</script>

<SEO
	title="{project?.title} - Project by {profile.name}"
	description={project?.description ?? ""}
	canonical="/projects/{project?.id}"
	ogType="article"
	ogImageAlt="{project?.title} project screenshot"
	articleMeta={{
		author: profile.name,
		publishedTime: project ? `${project.year}-01-01` : undefined,
		section: project?.category,
		tags: project?.techStack,
	}}
/>

<ProjectStructuredData {project} />

<main class="min-h-screen">
	<!-- Hero Section -->
	<div class="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto">
			<Breadcrumbs
				items={[
					{ name: "Home", url: "/" },
					{ name: "Projects", url: "/projects" },
					{ name: project?.title ?? "Project", url: "" },
				]}
			/>

			<div class="flex flex-wrap items-center gap-3 mb-4 mt-4">
				<Badge>{project?.category}</Badge>
				<span class="text-sm text-muted-foreground">{project?.year}</span>
			</div>

			<h1 class="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
				{project?.title}
			</h1>

			<p class="text-xl text-muted-foreground max-w-3xl">
				{project?.description}
			</p>
		</div>
	</div>

	<Section class="py-8">
		<div class="max-w-4xl mx-auto">
			<!-- Project Details Grid -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<Card class="p-6">
					<div class="text-sm text-muted-foreground mb-1">Company</div>
					<div class="font-semibold text-foreground">{project?.company}</div>
				</Card>
				<Card class="p-6">
					<div class="text-sm text-muted-foreground mb-1">Year</div>
					<div class="font-semibold text-foreground">{project?.year}</div>
				</Card>
				<Card class="p-6">
					<div class="text-sm text-muted-foreground mb-1">Category</div>
					<div class="font-semibold text-foreground">{project?.category}</div>
				</Card>
			</div>

			<!-- Features -->
			{#if project?.features && project.features.length > 0}
				<div class="mb-12">
					<h2 class="text-2xl font-bold mb-6 text-foreground">Key Features</h2>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{#each project.features as feature}
							<div
								class="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
							>
								<span class="text-primary mt-0.5">✓</span>
								<span class="text-muted-foreground">{feature}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Tech Stack -->
			{#if project?.techStack && project.techStack.length > 0}
				<div class="mb-12">
					<h2 class="text-2xl font-bold mb-6 text-foreground">Tech Stack</h2>
					<div class="flex flex-wrap gap-2">
						{#each project.techStack as tech}
							<span
								class="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground border border-border font-medium"
							>
								{tech}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- CTA -->
			<div class="flex flex-wrap gap-4 pt-8 border-t border-border">
				{#if project?.url}
					<Button
						href={project.url}
						target="_blank"
						rel="noopener noreferrer"
						size="lg"
					>
						Visit Project →
					</Button>
				{/if}
				<Button href="/contact" variant="secondary" size="lg">
					Discuss Similar Project
				</Button>
			</div>
		</div>
	</Section>

	<!-- Related Projects Section -->
	<div class="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-2xl font-bold mb-4 text-foreground">Want to see more?</h2>
			<p class="mb-8 text-muted-foreground">
				Explore my full portfolio of {profile?.stats?.projects ?? 0}+ projects
				across multiple industries.
			</p>
			<Button href="/projects" size="lg">View All Projects</Button>
		</div>
	</div>

	<Footer {profile} />
</main>
