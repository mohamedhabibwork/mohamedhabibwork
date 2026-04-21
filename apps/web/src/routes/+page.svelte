<script lang="ts">
	import About from "../components/About.svelte";
	import Contact from "../components/Contact.svelte";
	import Footer from "../components/Footer.svelte";
	import Hero from "../components/Hero.svelte";
	import Projects from "../components/Projects.svelte";
	import Skills from "../components/Skills.svelte";
	import Timeline from "../components/Timeline.svelte";
	import {
		useExperienceQuery,
		useProfileQuery,
		useProjectsQuery,
		useSkillsQuery,
	} from "../lib/queries";

	const profileQuery = useProfileQuery();
	const skillsQuery = useSkillsQuery();
	const projectsQuery = useProjectsQuery();
	const experienceQuery = useExperienceQuery();

	const profile = $derived(
		$profileQuery.data ?? {
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
		$skillsQuery.data ?? {
			backend: [],
			frontend: [],
			database: [],
			cloud: [],
			leadership: [],
			specializations: [],
		}
	);

	const featuredProjects = $derived(
		$projectsQuery.data?.projects.slice(0, 6) ?? []
	);

	const experience = $derived($experienceQuery.data?.slice(0, 5) ?? []);
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
