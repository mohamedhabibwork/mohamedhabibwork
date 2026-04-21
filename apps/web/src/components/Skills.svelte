<script lang="ts">
	import type { Skills } from "@habib-app/api/data";
	import Badge from "./ui/Badge.svelte";
	import Card from "./ui/Card.svelte";
	import Section from "./ui/Section.svelte";

	interface Props {
		skills: Skills;
	}

	const { skills }: Props = $props();

	type TabKey = "backend" | "frontend" | "database" | "cloud" | "leadership";

	const tabs: { key: TabKey; label: string }[] = [
		{ key: "backend", label: "Backend" },
		{ key: "frontend", label: "Frontend" },
		{ key: "database", label: "Database" },
		{ key: "cloud", label: "Cloud" },
		{ key: "leadership", label: "Leadership" },
	];

	let activeTab = $state<TabKey>("backend");

	function getLevelVariant(level: string): "success" | "info" | "warning" {
		switch (level.toLowerCase()) {
			case "expert":
				return "success";
			case "advanced":
				return "info";
			default:
				return "warning";
		}
	}
</script>

<Section id="skills" class="py-24 sm:py-32">
	<div class="text-center mb-16">
		<h2
			class="text-3xl sm:text-4xl font-bold mb-4"
			style="color: var(--text-primary);"
		>
			Skills & Expertise
		</h2>
		<p class="max-w-2xl mx-auto" style="color: var(--text-secondary);">
			Technologies and frameworks I work with to bring ideas to life
		</p>
	</div>

	<div class="flex flex-wrap justify-center gap-2 mb-12">
		{#each tabs as tab}
			<button
				type="button"
				onclick={() => (activeTab = tab.key)}
				class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
				style={activeTab === tab.key
					? "background-color: var(--accent); color: #ffffff;"
					: "background-color: var(--bg-secondary); color: var(--text-secondary);"}
				onmouseenter={(e) => {
					if (activeTab !== tab.key) {
						e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
						e.currentTarget.style.color = "var(--text-primary)";
					}
				}}
				onmouseleave={(e) => {
					if (activeTab !== tab.key) {
						e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
						e.currentTarget.style.color = "var(--text-secondary)";
					}
				}}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#if activeTab === "leadership"}
			{#each skills.leadership as item}
				<Card class="p-5">
					<div class="flex items-start justify-between mb-2">
						<h3
							class="text-lg font-semibold"
							style="color: var(--text-primary);"
						>
							{item.name}
						</h3>
						{#if item.years}
							<Badge variant="info">{item.years}+ yrs</Badge>
						{/if}
					</div>
					<p class="text-sm" style="color: var(--text-secondary);">
						{item.description}
					</p>
				</Card>
			{/each}
		{:else}
			{#each skills[activeTab] as skill}
				<Card class="p-5">
					<div class="flex items-start justify-between mb-2">
						<h3
							class="text-lg font-semibold"
							style="color: var(--text-primary);"
						>
							{skill.name}
						</h3>
						<Badge variant={getLevelVariant(skill.level)}>{skill.level}</Badge>
					</div>
					<div class="flex items-center gap-2 mb-2">
						<span class="text-sm" style="color: var(--text-muted);"
							>{skill.years}
							years</span
						>
						<span style="color: var(--border-color);">|</span>
						<span class="text-sm" style="color: var(--accent);"
							>{skill.description}</span
						>
					</div>
				</Card>
			{/each}
		{/if}
	</div>

	<div class="mt-12 text-center">
		<p class="text-sm mb-4" style="color: var(--text-muted);">
			Core Specializations
		</p>
		<div class="flex flex-wrap justify-center gap-2">
			{#each skills.specializations as spec}
				<Badge variant="default">{spec}</Badge>
			{/each}
		</div>
	</div>
</Section>
