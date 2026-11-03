import { createFileRoute } from "@tanstack/react-router";
import { ServiceCard } from "#/components/cards";
import { ContactForm } from "#/components/site";
import { EmptyState, SectionHeading } from "#/design-system/ui";
import { parsePrice, serviceOffer } from "#/lib/contact";
import { mostlyArabic } from "#/lib/localized";
import { breadcrumbs, jsonLd, localizedUrl, PERSON_ID, pageLocale, pageTitle, seo } from "#/lib/seo";
import { getServices } from "#/server/fn/public";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

export const Route = createFileRoute("/_site/services/")({
	loader: () => getServices({ data: { locale: getLocale() } }),
	head: ({ loaderData }) => {
		const rows = loaderData ?? [];
		const page = pageLocale("/services", mostlyArabic(rows.map((r) => r.hasArabic)));
		const { contentLocale: locale } = page;
		const base = seo({
			title: pageTitle(m.services_seo_title({}, { locale })),
			description: m.services_seo_description({ list: rows.map((r) => r.title.toLowerCase()).slice(0, 4).join(locale === "ar" ? "، " : ", ") }, { locale }),
			...page,
		});
		const catalog = {
			"@context": "https://schema.org",
			"@type": "ProfessionalService",
			name: m.services_catalog_name({}, { locale }),
			url: localizedUrl("/services", locale),
			inLanguage: locale,
			provider: { "@id": PERSON_ID },
			hasOfferCatalog: {
				"@type": "OfferCatalog",
				name: m.nav_services({}, { locale }),
				itemListElement: rows.map((r) => {
					const url = localizedUrl(`/services/${r.slug}`, r.hasArabic ? locale : "en");
					const price = parsePrice(r.startingAt);
					return { ...(price ? serviceOffer(price, url) : { "@type": "Offer" }), itemOffered: { "@type": "Service", name: r.title, description: r.summary, url } };
				}),
			},
		};
		return { ...base, scripts: [jsonLd(catalog), jsonLd(breadcrumbs(locale, [m.nav_services({}, { locale }), "/services"]))] };
	},
	component: ServicesPage,
});

function ServicesPage() {
	const rows = Route.useLoaderData();
	return (
		<>
			<main id="main" className="site">
				<section className="site-section">
					<SectionHeading as="h1" eyebrow={m.services_eyebrow()} title={m.nav_services()} description={m.services_description()} />
					{rows.length === 0 ? (
						<EmptyState icon="briefcase" title={m.services_empty()} />
					) : (
						<div className="mh-grid-3">{rows.map((s) => <ServiceCard key={s.id} service={s} />)}</div>
					)}
				</section>
				<section className="site-section" id="contact" aria-labelledby="services-contact">
					<SectionHeading id="services-contact" eyebrow={m.common_contact_eyebrow()} title={m.services_contact_title()} description={m.services_contact_description()} />
					<ContactForm services={rows} />
				</section>
			</main>
		</>
	);
}
