<script lang="ts">
	import type { Project } from "@habib-app/api/data";

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	const softwareSchema = $derived({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: project.title,
		description: project.description,
		applicationCategory: project.category,
		operatingSystem: "Web",
		author: {
			"@type": "Person",
			name: "Mohamed Habib",
			url: "https://mohamedhabib.work",
		},
		datePublished: `${project.year}-01-01`,
		softwareVersion: "1.0",
		programmingLanguage: project.techStack.join(", "),
		featureList: project.features,
		url: project.url ?? `https://mohamedhabib.work/projects/${project.id}`,
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(softwareSchema)}</script>`}
</svelte:head>
