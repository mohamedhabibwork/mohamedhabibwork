<script lang="ts">
	import About from "../../components/About.svelte";
	import Footer from "../../components/Footer.svelte";
	import Skills from "../../components/Skills.svelte";
	import Timeline from "../../components/Timeline.svelte";
	import Button from "../../components/ui/Button.svelte";
	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<svelte:head>
	<title>About - {data.profile.name}</title>
	<meta
		name="description"
		content="Learn more about {data.profile.name}, {data.profile.title} with {data.profile.stats.years}+ years of experience."
	>
</svelte:head>

<main class="min-h-screen">
	<div class="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto text-center">
			<h1
				class="text-4xl sm:text-5xl font-bold mb-4"
				style="color: var(--text-primary);"
			>
				About Me
			</h1>
			<p class="text-xl" style="color: var(--accent);">{data.profile.title}</p>
		</div>
	</div>

	<About
		bio={data.profile.bio}
		stats={data.profile.stats}
		location={data.profile.location}
	/>

	<div
		class="py-16 px-4 sm:px-6 lg:px-8"
		style="border-top: 1px solid var(--border-color);"
	>
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary);">
				Key Achievements
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
				<div
					class="p-4 rounded-lg"
					style="background-color: var(--card-bg); border: 1px solid var(--border-color);"
				>
					<p style="color: var(--text-secondary);">
						Led international teams across Egypt, Saudi Arabia & UAE
					</p>
				</div>
				<div
					class="p-4 rounded-lg"
					style="background-color: var(--card-bg); border: 1px solid var(--border-color);"
				>
					<p style="color: var(--text-secondary);">
						Managed projects worth $100K+ in development costs
					</p>
				</div>
				<div
					class="p-4 rounded-lg"
					style="background-color: var(--card-bg); border: 1px solid var(--border-color);"
				>
					<p style="color: var(--text-secondary);">
						{data.profile.stats.successRate}%+ project delivery success rate
					</p>
				</div>
				<div
					class="p-4 rounded-lg"
					style="background-color: var(--card-bg); border: 1px solid var(--border-color);"
				>
					<p style="color: var(--text-secondary);">
						Specialized in real-time tracking & payment systems
					</p>
				</div>
			</div>
		</div>
	</div>

	<Timeline experience={data.experience} />

	<Skills skills={data.skills} />

	<div
		class="py-16 px-4 sm:px-6 lg:px-8"
		style="border-top: 1px solid var(--border-color);"
	>
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">
				Ready to work together?
			</h2>
			<p class="mb-8" style="color: var(--text-secondary);">
				I'm always excited to discuss new opportunities, whether it's building
				enterprise applications, leading development teams, or architecting
				scalable solutions.
			</p>
			<Button href="/contact" size="lg">Get in Touch</Button>
		</div>
	</div>

	<Footer profile={data.profile} />
</main>
