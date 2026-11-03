import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ServiceCard } from "#/components/cards";
import { canPayOnline, PayPalCheckout } from "#/components/PayPalCheckout";
import { ContactForm } from "#/components/site";
import {
	ChipList,
	EmptyState,
	Icon,
	type IconName,
	LinkButton,
	MarkArt,
	SectionHeading,
} from "#/design-system/ui";
import { trackView } from "#/lib/analytics";
import {
	parseCheckoutPrice,
	parsePrice,
	serviceOffer,
	telHref,
	whatsappHref,
} from "#/lib/contact";
import { inArabic } from "#/lib/localize";
import {
	breadcrumbs,
	jsonLd,
	PERSON_ID,
	pageTitle,
	pageUrl,
	seo,
} from "#/lib/seo";
import { m } from "#/paraglide/messages";
import { getService } from "#/server/fn/public";

export const Route = createFileRoute("/_site/services/$slug")({
	loader: async ({ params }) => {
		const data = await getService({ data: params.slug });
		if (!data) throw notFound();
		return inArabic(data, (ar, d) => ({
			...d,
			service: ar.service(d.service),
			others: d.others.map(ar.service),
		}));
	},
	head: ({ loaderData, params }) => {
		if (!loaderData)
			return seo({
				title: pageTitle(m.service_not_found()),
				description: "This service doesn't exist.",
				path: `/services/${params.slug}`,
				noindex: true,
			});
		const { service: s, paypal, hasArabic } = loaderData;
		const path = `/services/${s.slug}`;
		const price = parsePrice(s.startingAt);
		const base = seo({
			title: pageTitle(
				price ? `${s.title} — ${s.startingAt}` : s.title,
				s.title,
			),
			description: s.summary,
			path,
			languages: hasArabic ? undefined : ["en"],
		});
		const service = {
			"@context": "https://schema.org",
			"@type": "Service",
			name: s.title,
			description: s.summary,
			url: pageUrl(path),
			serviceType: s.title,
			areaServed: "Worldwide",
			provider: { "@id": PERSON_ID },
			...(price
				? {
						offers: serviceOffer(
							price,
							pageUrl(
								`${path}${canPayOnline(parseCheckoutPrice(s.startingAt), paypal) ? "#book" : "#enquire"}`,
							),
						),
					}
				: {}),
		};
		return {
			...base,
			scripts: [
				jsonLd(service),
				jsonLd(breadcrumbs([m.nav_services(), "/services"], [s.title, path])),
			],
		};
	},
	notFoundComponent: () => (
		<main id="main" className="site" style={{ padding: "96px 0" }}>
			<EmptyState
				icon="search"
				title={m.service_not_found()}
				description={m.service_not_found_body()}
				action={<LinkButton href="/services">{m.service_see_all()}</LinkButton>}
			/>
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
	const paragraphs = s.description
		.split(/\n{2,}/)
		.map((t) => t.trim())
		.filter(Boolean);
	useEffect(
		() => trackView("service", s.slug, s.title, price ?? undefined),
		[s.slug, s.title, price?.amount, price?.currency],
	);
	return (
		<>
			<main id="main" className="site">
				<section className="mh-hero" aria-labelledby="service-title">
					<MarkArt className="mh-hero__art" position="right" />
					<span className="mh-hero__eyebrow">{m.service_eyebrow()}</span>
					<h1 className="mh-hero__title" id="service-title">
						{s.title}
					</h1>
					<p className="mh-hero__lead">{s.summary}</p>
					<div className="mh-hero__actions">
						<LinkButton
							href={payable ? "#book" : "#enquire"}
							size="lg"
							trailingIcon="arrow-right"
							data-track={payable ? "book" : undefined}
						>
							{!price
								? m.service_cta_contact()
								: payable
									? m.service_cta_book({ price: s.startingAt })
									: m.service_cta_request({ price: s.startingAt })}
						</LinkButton>
						{owner?.phone && (
							<LinkButton
								href={telHref(owner.phone)}
								size="lg"
								variant="outline"
								leadingIcon="phone"
							>
								{m.service_call()}
							</LinkButton>
						)}
						{owner?.phone && (
							<LinkButton
								href={whatsappHref(
									owner.phone,
									m.service_whatsapp_greeting({
										name: owner.name.split(" ")[0],
										service: s.title,
									}),
								)}
								target="_blank"
								rel="noopener noreferrer"
								size="lg"
								variant="ghost"
							>
								WhatsApp
							</LinkButton>
						)}
						{s.startingAt && !price && (
							<span className="mh-hero__eyebrow">
								{m.service_from({ price: s.startingAt })}
							</span>
						)}
					</div>
				</section>

				<div className="mh-grid-2 site-section project-detail">
					<div className="mh-card">
						<span className="mh-card__eyebrow">{m.overview()}</span>
						{(paragraphs.length ? paragraphs : [s.summary]).map((t) => (
							<p key={t}>{t}</p>
						))}
						{s.tech.length > 0 && (
							<>
								<span className="mh-card__eyebrow">{m.service_stack()}</span>
								<ChipList items={s.tech} label={m.project_stack()} />
							</>
						)}
					</div>
					{s.deliverables.length > 0 && (
						<section className="mh-card" aria-labelledby="deliverables-title">
							<h2 className="mh-card__eyebrow" id="deliverables-title">
								{m.service_deliverables()}
							</h2>
							<ul className="project-detail__list">
								{s.deliverables.map((d) => (
									<li key={d}>
										<Icon name={(s.icon as IconName) || "check"} size={16} />
										{d}
									</li>
								))}
							</ul>
						</section>
					)}
				</div>

				{payable && paypal && (
					<section
						className="site-section"
						id="book"
						aria-labelledby="book-title"
					>
						<SectionHeading
							id="book-title"
							eyebrow={m.service_book_eyebrow()}
							title={m.service_book_title({ service: s.title.toLowerCase() })}
							description={m.service_book_description({ price: s.startingAt })}
						/>
						<PayPalCheckout
							service={{ slug: s.slug, title: s.title }}
							price={checkoutPrice}
							paypal={paypal}
						/>
					</section>
				)}

				<section
					className="site-section"
					id="enquire"
					aria-labelledby="enquire-title"
				>
					<SectionHeading
						id="enquire-title"
						eyebrow={m.contact_eyebrow()}
						title={m.service_talk_title({ service: s.title.toLowerCase() })}
						description={m.service_talk_description()}
					/>
					<ContactForm service={{ slug: s.slug, title: s.title }} />
				</section>

				{others.length > 0 && (
					<nav className="site-section" aria-label={m.service_others()}>
						<h2 className="mh-card__eyebrow">{m.service_others()}</h2>
						<div className="mh-grid-3">
							{others.slice(0, 3).map((o) => (
								<ServiceCard key={o.slug} service={o} />
							))}
						</div>
					</nav>
				)}
			</main>
		</>
	);
}
