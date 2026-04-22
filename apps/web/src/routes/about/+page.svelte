<script lang="ts">
	import About from "../../components/About.svelte";
	import Breadcrumbs from "../../components/Breadcrumbs.svelte";
	import Footer from "../../components/Footer.svelte";
	import SEO from "../../components/SEO.svelte";
	import Skills from "../../components/Skills.svelte";
	import Timeline from "../../components/Timeline.svelte";
	import Button from "../../components/ui/Button.svelte";
	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();

	const profile = $derived(
		data.profile ?? {
			name: "Mohamed Habib",
			title: "Senior Full Stack Developer & Team Leader",
			bio: "",
			location: "Egypt",
			stats: { years: 7, projects: 50, industries: 5, successRate: 95 },
			availability: "",
			email: "",
			github: "https://github.com/mohamedhabibwork",
			linkedin: "https://linkedin.com/in/mohamedhabibwork",
			tagline: "",
			timezone: "",
			whatsapp: "",
		}
	);
	const skills = $derived(
		data.skills ?? {
			backend: [],
			frontend: [],
			database: [],
			cloud: [],
			leadership: [],
			specializations: [],
		}
	);
	const experience = $derived(data.experience ?? []);
</script>

<SEO
	title="About {profile.name} - {profile.title}"
	description="Learn more about {profile.name}, {profile.title} with {profile?.stats.years}+ years of experience in full-stack development, team leadership, and enterprise solutions."
	canonical="/about"
	ogType="profile"
/>

<main class="min-h-screen">
	<div class="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto">
			<Breadcrumbs
				items={[
					{ name: "Home", url: "/" },
					{ name: "About", url: "" },
				]}
			/>
			<div class="text-center mt-4">
				<h1 class="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
					About Me
				</h1>
				<p class="text-xl text-primary">{profile.title}</p>
			</div>
		</div>
	</div>

	<About
		bio={profile?.bio}
		stats={profile?.stats}
		location={profile?.location}
	/>

	<div class="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-2xl font-bold mb-6 text-foreground">Key Achievements</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
				<div class="p-4 rounded-lg bg-card border border-border">
					<p class="text-muted-foreground">
						Led international teams across Egypt, Saudi Arabia & UAE
					</p>
				</div>
				<div class="p-4 rounded-lg bg-card border border-border">
					<p class="text-muted-foreground">
						Managed projects worth $100K+ in development costs
					</p>
				</div>
				<div class="p-4 rounded-lg bg-card border border-border">
					<p class="text-muted-foreground">
						{profile?.stats.successRate}%+ project delivery success rate
					</p>
				</div>
				<div class="p-4 rounded-lg bg-card border border-border">
					<p class="text-muted-foreground">
						Specialized in real-time tracking & payment systems
					</p>
				</div>
			</div>
		</div>
	</div>

	<Timeline {experience} />

	<Skills {skills} />

	<div class="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-2xl font-bold mb-4 text-foreground">
				Ready to work together?
			</h2>
			<p class="mb-8 text-muted-foreground">
				I'm always excited to discuss new opportunities, whether it's building
				enterprise applications, leading development teams, or architecting
				scalable solutions.
			</p>
			<Button href="/contact" size="lg">Get in Touch</Button>
		</div>
	</div>

	<Footer {profile} />
</main>
