import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { OfferList } from "#/components/cards";
import { canPayOnline, PayPalCheckout } from "#/components/PayPalCheckout";
import { ContactForm } from "#/components/site";
import { ChipList, EmptyState, Icon, LinkButton, SectionHeading } from "#/design-system/ui";
import { trackView } from "#/lib/analytics";
import { parseCheckoutPrice, parsePrice, serviceOffer, telHref, whatsappHref } from "#/lib/contact";
import { absoluteUrl, breadcrumbs, jsonLd, PERSON_ID, pageTitle, seo } from "#/lib/seo";
import { getService } from "#/server/fn/public";

export const Route = createFileRoute("/_site/services/$slug")({
	loader: async ({ params }) => {
		const data = await getService({ data: params.slug });
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) return seo({ title: pageTitle("Service not found"), description: "This service doesn't exist.", path: `/services/${params.slug}`, noindex: true });
		const { service: s, paypal } = loaderData;
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
			...(price ? { offers: serviceOffer(price, absoluteUrl(`${path}${canPayOnline(parseCheckoutPrice(s.startingAt), paypal) ? "#book" : "#enquire"}`)) } : {}),
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
	const { service: s, others, owner, paypal } = Route.useLoaderData();
	const price = parsePrice(s.startingAt);
	// Services with one exact price in a PayPal currency are paid on the page; others go to the enquiry form.
	const checkoutPrice = parseCheckoutPrice(s.startingAt);
	const payable = canPayOnline(checkoutPrice, paypal);
	const paragraphs = s.description.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
	useEffect(() => trackView("service", s.slug, s.title, price ?? undefined), [s.slug, s.title, price?.amount, price?.currency]);
	return (
		<>
			<main id="main" className="site">
				<header className="case-head">
					<span className="case-head__crumb"><Link to="/services">Services</Link></span>
					<h1 id="service-title">{s.title}</h1>
					<p className="case-head__sub">{s.summary}</p>
				</header>

				<div className="case" style={{ paddingTop: 0 }}>
					<div className="case__body">
						<section aria-labelledby="overview-title">
							<h2 id="overview-title">Overview</h2>
							{(paragraphs.length ? paragraphs : [s.summary]).map((t) => <p key={t}>{t}</p>)}
						</section>
						{s.deliverables.length > 0 && (
							<section aria-labelledby="deliverables-title">
								<h2 id="deliverables-title">What you get</h2>
								<ul className="case__list">{s.deliverables.map((d) => <li key={d}><Icon name="check" size={16} />{d}</li>)}</ul>
							</section>
						)}
						{s.tech.length > 0 && (
							<section aria-labelledby="stack-title">
								<h2 id="stack-title">Typical stack</h2>
								<ChipList items={s.tech} label="Stack" />
							</section>
						)}
					</div>
					<aside className="spec" aria-label="Pricing and booking">
						<dl>
							<div><dt>Starting at</dt><dd className="spec__price">{s.startingAt || "Quote"}</dd></div>
						</dl>
						<div className="spec__actions">
							<LinkButton href={payable ? "#book" : "#enquire"} data-track={payable ? "book" : undefined}>
								{!price ? "Contact me about this" : payable ? "Book and pay" : "Request a session"}
							</LinkButton>
							{owner?.phone && <LinkButton href={telHref(owner.phone)} variant="outline" leadingIcon="phone">Call me</LinkButton>}
							{owner?.phone && (
								<LinkButton href={whatsappHref(owner.phone, `Hi ${owner.name.split(" ")[0]}, I'm interested in: ${s.title}`)} target="_blank" rel="noopener noreferrer" variant="ghost">
									Message on WhatsApp
								</LinkButton>
							)}
						</div>
					</aside>
				</div>

				{payable && paypal && (
					<section className="site-section" id="book" aria-labelledby="book-title">
						<SectionHeading id="book-title" title={`Book your ${s.title.toLowerCase()}`} description={`${s.startingAt} · secure checkout with PayPal or card. I'll email you within 24 hours to pick a time.`} />
						<PayPalCheckout service={{ slug: s.slug, title: s.title }} price={checkoutPrice} paypal={paypal} />
					</section>
				)}

				<section className="site-section" id="enquire" aria-labelledby="enquire-title">
					<SectionHeading id="enquire-title" title={`Let's talk about ${s.title.toLowerCase()}`} description="Your message comes straight to my inbox. I reply within 24 hours." />
					<ContactForm service={{ slug: s.slug, title: s.title }} />
				</section>

				{others.length > 0 && (
					<nav className="site-section" aria-label="Other services">
						<header className="page-head"><h2>Other services</h2></header>
						<OfferList services={others.slice(0, 3)} />
					</nav>
				)}
			</main>
		</>
	);
}
