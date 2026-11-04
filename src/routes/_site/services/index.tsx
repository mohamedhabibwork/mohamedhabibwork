import { createFileRoute } from "@tanstack/react-router";
import { OfferList } from "#/components/cards";
import { ContactForm } from "#/components/site";
import { EmptyState, SectionHeading } from "#/design-system/ui";
import { parsePrice, serviceOffer } from "#/lib/contact";
import { absoluteUrl, breadcrumbs, jsonLd, PERSON_ID, pageTitle, seo } from "#/lib/seo";
import { getServices } from "#/server/fn/public";

export const Route = createFileRoute("/_site/services/")({
	loader: () => getServices(),
	head: ({ loaderData }) => {
		const rows = loaderData ?? [];
		const base = seo({
			title: pageTitle("Software Development Services"),
			description: `Hire me for ${rows.map((r) => r.title.toLowerCase()).slice(0, 4).join(", ")} and more.`,
			path: "/services",
		});
		const catalog = {
			"@context": "https://schema.org",
			"@type": "ProfessionalService",
			name: "Mohamed Habib — Software development",
			url: absoluteUrl("/services"),
			provider: { "@id": PERSON_ID },
			hasOfferCatalog: {
				"@type": "OfferCatalog",
				name: "Services",
				itemListElement: rows.map((r) => {
					const url = absoluteUrl(`/services/${r.slug}`);
					const price = parsePrice(r.startingAt);
					return { ...(price ? serviceOffer(price, url) : { "@type": "Offer" }), itemOffered: { "@type": "Service", name: r.title, description: r.summary, url } };
				}),
			},
		};
		return { ...base, scripts: [jsonLd(catalog), jsonLd(breadcrumbs(["Services", "/services"]))] };
	},
	component: ServicesPage,
});

function ServicesPage() {
	const rows = Route.useLoaderData();
	return (
		<>
			<main id="main" className="site">
				<section className="site-section">
					<header className="page-head" style={{ paddingTop: 24 }}>
						<h1>Services</h1>
						<p>Pick what you need. Every enquiry comes straight to my inbox, and I reply within 24 hours.</p>
					</header>
					{rows.length === 0 ? (
						<EmptyState icon="briefcase" title="No services listed yet" />
					) : (
						<OfferList services={rows} />
					)}
				</section>
				<section className="site-section" id="contact" aria-labelledby="services-contact">
					<SectionHeading id="services-contact" title="Not sure which fits?" description="Tell me about your project and I'll suggest the right approach." />
					<ContactForm services={rows} />
				</section>
			</main>
		</>
	);
}
