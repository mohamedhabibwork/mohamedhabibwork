import { createFileRoute, notFound } from "@tanstack/react-router";
import { ServiceCard } from "#/components/cards";
import { ContactForm, SiteFooter, SiteHeader } from "#/components/site";
import { ChipList, EmptyState, Icon, type IconName, LinkButton, MarkArt, SectionHeading } from "#/design-system/ui";
import { BOOKING_URL, parsePrice, serviceOffer, telHref, whatsappHref } from "#/lib/contact";
import { absoluteUrl, breadcrumbs, jsonLd, PERSON_ID, pageTitle, seo } from "#/lib/seo";
import { getService } from "#/server/fn/public";

export const Route = createFileRoute("/services/$slug")({
	loader: async ({ params }) => {
		const data = await getService({ data: params.slug });
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) return seo({ title: pageTitle("Service not found"), description: "This service doesn't exist.", path: `/services/${params.slug}`, noindex: true });
		const { service: s } = loaderData;
		const path = `/services/${s.slug}`;
		const price = parsePrice(s.startingAt);
		const base = seo({ title: pageTitle(price ? `${s.title} — ${s.startingAt}` : s.title, s.title), description: s.summary, path });
		const service = {
			"@context": "https://schema.org",
			"@type": "Service",
			name: s.title,
			description: s.summary,
			url: absoluteUrl(path),
			serviceType: s.title,
			areaServed: "Worldwide",
			provider: { "@id": PERSON_ID },
			...(price ? { offers: serviceOffer(price, BOOKING_URL ?? absoluteUrl(`${path}#enquire`)) } : {}),
		};
		return { ...base, scripts: [jsonLd(service), jsonLd(breadcrumbs(["Services", "/services"], [s.title, path]))] };
	},
	notFoundComponent: () => (
		<main id="main" className="site" style={{ padding: "96px 0" }}>
			<EmptyState icon="search" title="Service not found" description="It may have been renamed or removed." action={<LinkButton href="/services">See all services</LinkButton>} />
		</main>
	),
	component: ServicePage,
});

function ServicePage() {
	const { service: s, others, owner } = Route.useLoaderData();
	const price = parsePrice(s.startingAt);
	// Priced services can be booked and paid directly when a booking page is configured.
	const bookingHref = price && BOOKING_URL ? BOOKING_URL : "#enquire";
	const paragraphs = s.description.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
	return (
		<>
			<SiteHeader />
			<main id="main" className="site">
				<section className="mh-hero" aria-labelledby="service-title">
					<MarkArt className="mh-hero__art" position="right" />
					<span className="mh-hero__eyebrow">Service</span>
					<h1 className="mh-hero__title" id="service-title">{s.title}</h1>
					<p className="mh-hero__lead">{s.summary}</p>
					<div className="mh-hero__actions">
						<LinkButton
							href={bookingHref}
							size="lg"
							trailingIcon="arrow-right"
							data-track={bookingHref === BOOKING_URL ? "book" : undefined}
							{...(bookingHref === BOOKING_URL ? { target: "_blank", rel: "noopener noreferrer" } : {})}
						>
							{!price ? "Contact me about this" : bookingHref === BOOKING_URL ? `Book & pay · ${s.startingAt}` : `Request a session · ${s.startingAt}`}
						</LinkButton>
						{owner?.phone && <LinkButton href={telHref(owner.phone)} size="lg" variant="outline" leadingIcon="phone">Call me</LinkButton>}
						{owner?.phone && (
							<LinkButton href={whatsappHref(owner.phone, `Hi ${owner.name.split(" ")[0]}, I'm interested in: ${s.title}`)} target="_blank" rel="noopener noreferrer" size="lg" variant="ghost">
								WhatsApp
							</LinkButton>
						)}
						{s.startingAt && !price && <span className="mh-hero__eyebrow">From {s.startingAt}</span>}
					</div>
				</section>

				<div className="mh-grid-2 site-section project-detail">
					<div className="mh-card">
						<span className="mh-card__eyebrow">Overview</span>
						{(paragraphs.length ? paragraphs : [s.summary]).map((t) => <p key={t}>{t}</p>)}
						{s.tech.length > 0 && <><span className="mh-card__eyebrow">Typical stack</span><ChipList items={s.tech} label="Stack" /></>}
					</div>
					{s.deliverables.length > 0 && (
						<section className="mh-card" aria-labelledby="deliverables-title">
							<h2 className="mh-card__eyebrow" id="deliverables-title">What you get</h2>
							<ul className="project-detail__list">{s.deliverables.map((d) => <li key={d}><Icon name={(s.icon as IconName) || "check"} size={16} />{d}</li>)}</ul>
						</section>
					)}
				</div>

				<section className="site-section" id="enquire" aria-labelledby="enquire-title">
					<SectionHeading id="enquire-title" eyebrow="Contact" title={`Let's talk about ${s.title.toLowerCase()}`} description="Your message comes straight to my inbox. I reply within 24 hours." />
					<ContactForm service={{ slug: s.slug, title: s.title }} />
				</section>

				{others.length > 0 && (
					<nav className="site-section" aria-label="Other services">
						<h2 className="mh-card__eyebrow">Other services</h2>
						<div className="mh-grid-3">{others.slice(0, 3).map((o) => <ServiceCard key={o.slug} service={o} />)}</div>
					</nav>
				)}
			</main>
			<SiteFooter />
		</>
	);
}
