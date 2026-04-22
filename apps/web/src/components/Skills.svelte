<script lang="ts">
	import type { Skills } from "@habib-app/api/data";
	import ScrollReveal from "./ScrollReveal.svelte";
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
	let isTransitioning = $state(false);

	function handleTabChange(tab: TabKey) {
		if (tab === activeTab || isTransitioning) {
			return;
		}
		isTransitioning = true;
		setTimeout(() => {
			activeTab = tab;
			requestAnimationFrame(() => {
				isTransitioning = false;
			});
		}, 150);
	}

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
	<ScrollReveal>
		<div class="text-center mb-16">
			<h2 class="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
				Skills & Expertise
			</h2>
			<p class="max-w-2xl mx-auto text-muted-foreground">
				Technologies and frameworks I work with to bring ideas to life
			</p>
		</div>
	</ScrollReveal>

	<!-- Animated Tab Buttons -->
	<ScrollReveal delay={100}>
		<div class="flex flex-wrap justify-center gap-2 mb-12">
			{#each tabs as tab}
				<button
					type="button"
					onclick={() => handleTabChange(tab.key)}
					class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden"
					class:bg-primary={activeTab === tab.key}
					class:text-primary-foreground={activeTab === tab.key}
					class:shadow-md={activeTab === tab.key}
					class:bg-secondary={activeTab !== tab.key}
					class:text-secondary-foreground={activeTab !== tab.key}
					onmouseenter={(e) => {
						if (activeTab !== tab.key) {
							e.currentTarget.classList.add("bg-muted");
						}
					}}
					onmouseleave={(e) => {
						if (activeTab !== tab.key) {
							e.currentTarget.classList.remove("bg-muted");
						}
					}}
				>
					{tab.label}
				</button>
			{/each}
		</div>
	</ScrollReveal>

	<!-- Skills Grid with transition -->
	<div
		class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
		style="opacity: {isTransitioning ? 0 : 1}; transform: {isTransitioning
			? 'translateY(10px)'
			: 'translateY(0)'}; transition: opacity 0.3s ease, transform 0.3s ease;"
	>
		{#if activeTab === "leadership"}
			{#each skills.leadership as item, i}
				<Card class="p-5" glow style="animation-delay: {i * 50}ms">
					<div class="flex items-start justify-between mb-2">
						<h3 class="text-lg font-semibold text-card-foreground">
							{item.name}
						</h3>
						{#if item.years}
							<Badge variant="info">{item.years}+ yrs</Badge>
						{/if}
					</div>
					<p class="text-sm text-muted-foreground">{item.description}</p>
				</Card>
			{/each}
		{:else}
			{#each skills[activeTab] as skill, i}
				<Card class="p-5" glow style="animation-delay: {i * 50}ms">
					<div class="flex items-start justify-between mb-2">
						<h3 class="text-lg font-semibold text-card-foreground">
							{skill.name}
						</h3>
						<Badge variant={getLevelVariant(skill.level)}>{skill.level}</Badge>
					</div>
					<div class="flex items-center gap-2 mb-2">
						<span class="text-sm text-muted-foreground"
							>{skill.years}
							years</span
						>
						<span class="text-border">|</span>
						<span class="text-sm text-primary">{skill.description}</span>
					</div>
				</Card>
			{/each}
		{/if}
	</div>

	<ScrollReveal>
		<div class="mt-12 text-center">
			<p class="text-sm mb-4 text-muted-foreground">Core Specializations</p>
			<div class="flex flex-wrap justify-center gap-2">
				{#each skills.specializations as spec}
					<Badge variant="outline">{spec}</Badge>
				{/each}
			</div>
		</div>
	</ScrollReveal>
</Section>
