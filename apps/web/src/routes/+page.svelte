<script lang="ts">
	import About from "../components/About.svelte";
	import Contact from "../components/Contact.svelte";
	import Footer from "../components/Footer.svelte";
	import Hero from "../components/Hero.svelte";
	import Projects from "../components/Projects.svelte";
	import Skills from "../components/Skills.svelte";
	import Timeline from "../components/Timeline.svelte";
	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();

	const profile = $derived(
		data.profile ?? {
			name: "Mohamed Habib",
			title: "",
			tagline: "",
			bio: "",
			location: "",
			stats: { years: 0, projects: 0, industries: 0, successRate: 0 },
			linkedin: "",
			github: "",
			whatsapp: "",
			email: "",
			availability: "",
			timezone: "",
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

	const featuredProjects = $derived(data.projects?.projects.slice(0, 6) ?? []);

	const experience = $derived(data.experience?.slice(0, 5) ?? []);
</script>

<svelte:head>
	<title>{profile.name} - {profile.title}</title>
	<meta name="description" content={profile.tagline}>
</svelte:head>

<main>
	<Hero {profile} />

	<About bio={profile.bio} stats={profile.stats} location={profile.location} />

	<Skills {skills} />

	<Projects projects={featuredProjects} />

	<Timeline {experience} />

	<Contact {profile} />

	<Footer {profile} />
</main>
