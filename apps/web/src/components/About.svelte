<script lang="ts">
	import type { Profile } from "@habib-app/api/data";
	import ScrollReveal from "./ScrollReveal.svelte";
	import Card from "./ui/Card.svelte";
	import Section from "./ui/Section.svelte";

	interface Props {
		profile: Partial<Profile>;
	}

	const { profile }: Props = $props();
</script>

<Section id="about" class="py-24 sm:py-32">
	<ScrollReveal>
		<div class="text-center mb-16">
			<h2 class="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
				About Me
			</h2>
			<p class="max-w-2xl mx-auto text-muted-foreground">{profile?.bio}</p>
			{#if profile?.location}
				<p class="text-sm mt-2 text-muted-foreground">📍 {profile?.location}</p>
			{/if}
		</div>
	</ScrollReveal>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
		<ScrollReveal delay={100}>
			<Card class="p-6 text-center" glow>
				<div class="text-4xl font-bold mb-2 gradient-text">
					{profile?.stats?.years}+
				</div>
				<div class="text-secondary-foreground">Years of Experience</div>
				<p class="text-sm mt-2 text-muted-foreground">
					Building scalable solutions and leading teams to success
				</p>
			</Card>
		</ScrollReveal>

		<ScrollReveal delay={200}>
			<Card class="p-6 text-center" glow>
				<div class="text-4xl font-bold mb-2 gradient-text">
					{profile?.stats?.projects}+
				</div>
				<div class="text-secondary-foreground">Projects Completed</div>
				<p class="text-sm mt-2 text-muted-foreground">
					From startups to enterprise-level applications
				</p>
			</Card>
		</ScrollReveal>

		<ScrollReveal delay={300}>
			<Card class="p-6 text-center" glow>
				<div class="text-4xl font-bold mb-2 gradient-text">
					{profile?.stats?.successRate}%
				</div>
				<div class="text-secondary-foreground">Success Rate</div>
				<p class="text-sm mt-2 text-muted-foreground">
					Delivering on promises and exceeding expectations
				</p>
			</Card>
		</ScrollReveal>
	</div>
</Section>
