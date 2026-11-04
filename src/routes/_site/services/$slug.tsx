import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { OfferList } from "#/components/cards";
import { canPayOnline, PayPalCheckout } from "#/components/PayPalCheckout";
import { ContactForm } from "#/components/site";
import { ChipList, EmptyState, Icon, LinkButton, SectionHeading } from "#/design-system/ui";
import { trackView } from "#/lib/analytics";
import { parseCheckoutPrice, parsePrice, serviceOffer, telHref, whatsappHref } from "#/lib/contact";
import { breadcrumbs, jsonLd, localizedUrl, PERSON_ID, pageLocale, pageTitle, seo } from "#/lib/seo";
import { getService } from "#/server/fn/public";
import { m } from "#/paraglide/messages";
import { getLocale, localizeHref } from "#/paraglide/runtime";

export const Route = createFileRoute("/_site/services/$slug")({
	loader: async ({ params }) => {
		const data = await getService({ data: { slug: params.slug, locale: getLocale() } });
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, params }) => {
		if (!loaderData) return seo({ title: pageTitle(m.service_not_found_title()), description: m.service_not_found_seo(), path: `/services/${params.slug}`, noindex: true });
		const { service: s, paypal, hasArabic } = loaderData;
		const path = `/services/${s.slug}`;
		const page = pageLocale(path, hasArabic);
		const { contentLocale: locale } = page;
		const price = parsePrice(s.startingAt);
		const base = seo({ title: pageTitle(price ? `${s.title} — ${s.startingAt}` : s.title, s.title), description: s.summary, ...page });
		const service = {
			"@context": "https://schema.org",
			"@type": "Service",
			name: s.title,
			description: s.summary,
			url: localizedUrl(path, locale),
			inLanguage: locale,
			serviceType: s.title,
			areaServed: "Worldwide",
			provider: { "@id": PERSON_ID },
			...(price ? { offers: serviceOffer(price, localizedUrl(`${path}${canPayOnline(parseCheckoutPrice(s.startingAt), paypal) ? "#book" : "#enquire"}`, locale)) } : {}),
		};
		return { ...base, scripts: [jsonLd(service), jsonLd(breadcrumbs(locale, [m.nav_services({}, { locale }), "/services"], [s.title, path]))] };
	},
	notFoundComponent: () => (
		<main id="main" className="site" style={{ padding: "96px 0" }}>
			<EmptyState icon="search" title={m.service_not_found_title()} description={m.service_not_found_body()} action={<LinkButton href={localizeHref("/services")}>{m.service_see_all()}</LinkButton>} />
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
					<span className="case-head__crumb"><Link to="/services">{m.nav_services()}</Link></span>
					<h1 id="service-title">{s.title}</h1>
					<p className="case-head__sub">{s.summary}</p>
				</header>

				<div className="case" style={{ paddingTop: 0 }}>
					<div className="case__body">
						<section aria-labelledby="overview-title">
							<h2 id="overview-title">{m.common_overview()}</h2>
							{(paragraphs.length ? paragraphs : [s.summary]).map((t) => <p key={t}>{t}</p>)}
						</section>
						{s.deliverables.length > 0 && (
							<section aria-labelledby="deliverables-title">
								<h2 id="deliverables-title">{m.service_deliverables()}</h2>
								<ul className="case__list">{s.deliverables.map((d) => <li key={d}><Icon name="check" size={16} />{d}</li>)}</ul>
							</section>
						)}
						{s.tech.length > 0 && (
							<section aria-labelledby="stack-title">
								<h2 id="stack-title">{m.service_stack()}</h2>
								<ChipList items={s.tech} label={m.common_stack()} />
							</section>
						)}
					</div>
					<aside className="spec" aria-label="Pricing and booking">
						<dl>
							<div><dt>Starting at</dt><dd className="spec__price">{s.startingAt || "Quote"}</dd></div>
						</dl>
						<div className="spec__actions">
							<LinkButton href={payable ? "#book" : "#enquire"} data-track={payable ? "book" : undefined}>
								{!price ? m.service_contact() : payable ? m.service_book_pay({ price: s.startingAt }) : m.service_request({ price: s.startingAt })}
							</LinkButton>
							{owner?.phone && <LinkButton href={telHref(owner.phone)} variant="outline" leadingIcon="phone">{m.service_call()}</LinkButton>}
							{owner?.phone && (
								<LinkButton href={whatsappHref(owner.phone, m.service_whatsapp_message({ name: owner.name.split(" ")[0], title: s.title }))} target="_blank" rel="noopener noreferrer" variant="ghost">
									{m.common_whatsapp()}
								</LinkButton>
							)}
						</div>
					</aside>
				</div>

				{payable && paypal && (
					<section className="site-section" id="book" aria-labelledby="book-title">
						<SectionHeading id="book-title" eyebrow={m.service_book_eyebrow()} title={m.service_book_title({ title: s.title.toLowerCase() })} description={m.service_book_description({ price: s.startingAt })} />
						<PayPalCheckout service={{ slug: s.slug, title: s.title }} price={checkoutPrice} paypal={paypal} />
					</section>
				)}

				<section className="site-section" id="enquire" aria-labelledby="enquire-title">
					<SectionHeading id="enquire-title" eyebrow={m.common_contact_eyebrow()} title={m.service_enquire_title({ title: s.title.toLowerCase() })} description={m.common_reply_24h()} />
					<ContactForm service={{ slug: s.slug, title: s.title }} />
				</section>

				{others.length > 0 && (
					<nav className="site-section" aria-label={m.service_others()}>
						<header className="page-head"><h2>{m.service_others()}</h2></header>
						<OfferList services={others.slice(0, 3)} />
					</nav>
				)}
			</main>
		</>
	);
}
