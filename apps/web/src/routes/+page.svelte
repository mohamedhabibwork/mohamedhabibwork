<script lang="ts">
	import About from "../components/About.svelte";
	import Contact from "../components/Contact.svelte";
	import Footer from "../components/Footer.svelte";
	import Hero from "../components/Hero.svelte";
	import Projects from "../components/Projects.svelte";
	import Skills from "../components/Skills.svelte";
	import Timeline from "../components/Timeline.svelte";

	interface Props {
		data: {
			profile: typeof import("$lib/data/profile").profile;
			skills: typeof import("$lib/data/skills").skills;
			featuredProjects: typeof import("$lib/data/projects").projects;
			experience: typeof import("$lib/data/experience").experience;
		};
	}

	const { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.profile.name} - {data.profile.title}</title>
	<meta name="description" content={data.profile.tagline}>
</svelte:head>

<main>
	<Hero />

	<About
		bio={data.profile.bio}
		stats={data.profile.stats}
		location={data.profile.location}
	/>

	<Skills skills={data.skills} />

	<Projects projects={data.featuredProjects} />

	<Timeline experience={data.experience} />

	<Contact profile={data.profile} />

	<Footer profile={data.profile} />
</main>
