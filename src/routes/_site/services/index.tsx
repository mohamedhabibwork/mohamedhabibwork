import { createFileRoute } from "@tanstack/react-router";
import { ServiceCard } from "#/components/cards";
import { ContactForm } from "#/components/site";
import { EmptyState, SectionHeading } from "#/design-system/ui";
import { parsePrice, serviceOffer } from "#/lib/contact";
import { inArabic } from "#/lib/localize";
import {
	breadcrumbs,
	forLocale,
	jsonLd,
	PERSON_ID,
	pageTitle,
	pageUrl,
	seo,
} from "#/lib/seo";
import { SEO_AR } from "#/lib/seo-ar";
import { m } from "#/paraglide/messages";
import { getServices } from "#/server/fn/public";

export const Route = createFileRoute("/_site/services/")({
	loader: async () =>
		inArabic(await getServices(), (ar, rows) => rows.map(ar.service)),
	head: ({ loaderData }) => {
		const rows = loaderData ?? [];
		const base = seo({
			title: pageTitle(
				forLocale("Software Development Services", SEO_AR.services.title),
			),
			description: forLocale(
				`Hire me for ${rows
					.map((r) => r.title.toLowerCase())
					.slice(0, 4)
					.join(", ")} and more.`,
				SEO_AR.services.description,
			),
			path: "/services",
		});
		const catalog = {
			"@context": "https://schema.org",
			"@type": "ProfessionalService",
			name: "Mohamed Habib — Software development",
			url: pageUrl("/services"),
			provider: { "@id": PERSON_ID },
			hasOfferCatalog: {
				"@type": "OfferCatalog",
				name: "Services",
				itemListElement: rows.map((r) => {
					const url = pageUrl(`/services/${r.slug}`);
					const price = parsePrice(r.startingAt);
					return {
						...(price ? serviceOffer(price, url) : { "@type": "Offer" }),
						itemOffered: {
							"@type": "Service",
							name: r.title,
							description: r.summary,
							url,
						},
					};
				}),
			},
		};
		return {
			...base,
			scripts: [
				jsonLd(catalog),
				jsonLd(breadcrumbs([m.nav_services(), "/services"])),
			],
		};
	},
	component: ServicesPage,
});

function ServicesPage() {
	const rows = Route.useLoaderData();
	return (
		<>
			<main id="main" className="site">
				<section className="site-section">
					<SectionHeading
						as="h1"
						eyebrow={m.services_page_eyebrow()}
						title={m.nav_services()}
						description={m.services_page_description()}
					/>
					{rows.length === 0 ? (
						<EmptyState icon="briefcase" title={m.services_empty()} />
					) : (
						<div className="mh-grid-3">
							{rows.map((s) => (
								<ServiceCard key={s.id} service={s} />
							))}
						</div>
					)}
				</section>
				<section
					className="site-section"
					id="contact"
					aria-labelledby="services-contact"
				>
					<SectionHeading
						id="services-contact"
						eyebrow={m.contact_eyebrow()}
						title={m.services_unsure_title()}
						description={m.services_unsure_description()}
					/>
					<ContactForm services={rows} />
				</section>
			</main>
		</>
	);
}
