<script lang="ts">
	import type { Profile } from "@habib-app/api/data";

	interface Props {
		profile: Profile;
	}

	const { profile }: Props = $props();

	const personSchema = $derived({
		"@context": "https://schema.org",
		"@type": "Person",
		name: profile.name,
		jobTitle: profile.title,
		description: profile?.bio,
		url: "https://mohamedhabib.work",
		image: "https://mohamedhabib.work/logo.png",
		sameAs: [
			profile.linkedin,
			profile.github,
			"https://twitter.com/mohamedhabib",
		].filter(Boolean),
		address: profile?.location
			? {
					"@type": "PostalAddress",
					addressLocality: profile?.location,
				}
			: undefined,
		worksFor: {
			"@type": "Organization",
			name: "Freelance / Consultant",
		},
		alumniOf: {
			"@type": "EducationalOrganization",
			name: "Information Technology Institute (ITI)",
		},
		knowsAbout: [
			"Full Stack Development",
			"Laravel",
			"Node.js",
			"React",
			"Vue.js",
			"Team Leadership",
			"Cloud Architecture",
			"Enterprise Solutions",
		],
	});

	const websiteSchema = $derived({
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: `${profile.name} - Portfolio`,
		url: "https://mohamedhabib.work",
		potentialAction: {
			"@type": "SearchAction",
			target: "https://mohamedhabib.work/projects?q={search_term_string}",
			"query-input": "required name=search_term_string",
		},
	});

	const professionalServiceSchema = $derived({
		"@context": "https://schema.org",
		"@type": "ProfessionalService",
		name: `${profile.name} - Full Stack Development Services`,
		description: profile.tagline,
		url: "https://mohamedhabib.work",
		logo: "https://mohamedhabib.work/logo.png",
		image: "https://mohamedhabib.work/logo.png",
		address: profile?.location
			? {
					"@type": "PostalAddress",
					addressLocality: profile?.location,
					addressCountry: "EG",
				}
			: undefined,
		priceRange: "$$",
		openingHoursSpecification: {
			"@type": "OpeningHoursSpecification",
			dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
			opens: "09:00",
			closes: "18:00",
		},
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(personSchema)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(professionalServiceSchema)}</script>`}
</svelte:head>
