<script lang="ts">
	import About from "../components/About.svelte";
	import Breadcrumbs from "../components/Breadcrumbs.svelte";
	import Contact from "../components/Contact.svelte";
	import Footer from "../components/Footer.svelte";
	import Hero from "../components/Hero.svelte";
	import Projects from "../components/Projects.svelte";
	import SEO from "../components/SEO.svelte";
	import Skills from "../components/Skills.svelte";
	import StructuredData from "../components/StructuredData.svelte";
	import Timeline from "../components/Timeline.svelte";
	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();

	const profile = $derived(
		data.profile ?? {
			name: "Mohamed Habib",
			title: "Senior Full Stack Developer & Team Leader",
			tagline:
				"Transforming ideas into scalable digital solutions with 7+ years of expertise in enterprise development and team leadership.",
			bio: "",
			location: "Egypt",
			stats: { years: 7, projects: 50, industries: 5, successRate: 95 },
			linkedin: "https://linkedin.com/in/mohamedhabibwork",
			github: "https://github.com/mohamedhabibwork",
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

<SEO
	title="{profile.name} - {profile.title}"
	description={profile.tagline}
	canonical="/"
	ogType="profile"
/>

<StructuredData {profile} />

<main>
	<Hero {profile} />

	<About {profile} />

	<Skills {skills} />

	<Projects projects={featuredProjects} />

	<Timeline {experience} />

	<Contact {profile} />

	<Footer {profile} />
</main>
