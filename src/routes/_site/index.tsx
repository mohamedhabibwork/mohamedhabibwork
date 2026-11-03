import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Alert,
	Icon,
	LinkButton,
	Logo,
	MarkArt,
	SectionHeading,
	SkillMeter,
	StatCard,
	Timeline,
} from "#/design-system/ui";
import { contactPoints, parsePrice, serviceOffer, telHref, whatsappHref } from "#/lib/contact";
import { homeProjects } from "#/lib/localized";
import { absoluteUrl, jsonLd, localizedUrl, PERSON_ID, pageLocale, SITE_NAME, SITE_URL, seo, TITLE_MAX } from "#/lib/seo";
import { type SkillEvidence, skillEvidence } from "#/lib/skill-evidence";
import { ProjectCard, ServiceCard } from "#/components/cards";
import { ContactForm } from "#/components/site";
import { getPortfolio } from "#/server/fn/public";
import { m } from "#/paraglide/messages";
import { getLocale, localizeHref } from "#/paraglide/runtime";

export const Route = createFileRoute("/_site/")({
	loader: () => getPortfolio({ data: { locale: getLocale() } }),
	head: ({ loaderData }) => {
		const p = loaderData?.profile;
		const page = pageLocale("/", loaderData?.hasArabic ?? false);
		const { contentLocale: locale } = page;
		const homeUrl = localizedUrl("/", locale);
		const name = p?.name ?? SITE_NAME;
		// Headline reads "Senior Full-Stack Engineer · .NET Core & C# · …"; the first part is the role.
		const role = p?.headline.split(/[·|]/)[0].trim() || m.home_default_role({}, { locale });
		const title = [m.home_title({ name, role }, { locale }), `${name} · ${role}`].find((t) => t.length <= TITLE_MAX) ?? `${name} · ${role}`;
		const base = seo({
			title,
			description: m.home_description({}, { locale }),
			...page,
			type: "profile",
		});
		if (!p) return base;
		const current = loaderData.experiences.find((e) => e.current);
		const person = {
			"@context": "https://schema.org",
			"@type": "Person",
			"@id": PERSON_ID,
			name: p.name,
			jobTitle: role,
			description: p.summary,
			email: `mailto:${p.email}`,
			...(p.phone ? { telephone: telHref(p.phone).slice(4) } : {}),
			contactPoint: contactPoints(p),
			url: homeUrl,
			image: absoluteUrl("/brand/images/profile.jpg"),
			...(p.location ? { homeLocation: { "@type": "Place", name: p.location } } : {}),
			...(current ? { worksFor: { "@type": "Organization", name: current.company } } : {}),
			alumniOf: p.education.map((e) => ({ "@type": "EducationalOrganization", name: e.school })),
			sameAs: [p.github, p.linkedin].filter(Boolean),
			knowsAbout: [...new Set(loaderData.skills.map((s) => s.name))],
			makesOffer: loaderData.services.flatMap((s) => {
				const price = parsePrice(s.startingAt);
				const url = localizedUrl(`/services/${s.slug}`, locale);
				return price ? [{ ...serviceOffer(price, url), itemOffered: { "@type": "Service", name: s.title, url } }] : [];
			}),
		};
		const site = { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: p.name, url: homeUrl, inLanguage: locale, publisher: { "@id": PERSON_ID } };
		const profilePage = { "@context": "https://schema.org", "@type": "ProfilePage", url: homeUrl, name: title, inLanguage: locale, isPartOf: { "@id": `${SITE_URL}/#website` }, mainEntity: { "@id": PERSON_ID } };
		return { ...base, scripts: [jsonLd(person), jsonLd(site), jsonLd(profilePage)] };
	},
	component: Home,
});

type Portfolio = Awaited<ReturnType<typeof getPortfolio>>;


function Home() {
	const data = Route.useLoaderData();
	const p = data.profile;
	if (!p) {
		return (
			<main id="main" className="site" style={{ padding: "96px 0" }}>
				<Alert variant="info" title={m.home_empty_title()}>{m.home_empty_body()}</Alert>
			</main>
		);
	}
	const mainCv = data.publicCvs[0];
	return (
		<>

			<main id="main" className="site">
				<section className="mh-hero" aria-labelledby="hero-title">
					<MarkArt className="mh-hero__art" position="right" />
					<div className="mh-row" style={{ gap: 16 }}>
						<Logo variant="mark" size={112} />
						<span className="mh-hero__eyebrow">{p.availability || p.location}</span>
					</div>
					<h1 className="mh-hero__title" id="hero-title">
						{p.headline.split(/[·|&]/)[0].trim()} <em>{m.home_hero_suffix()}</em>
					</h1>
					<p className="mh-hero__lead">{p.tagline}</p>
					<div className="mh-hero__actions">
						<LinkButton href="#work" size="lg" trailingIcon="arrow-right">{m.home_see_work()}</LinkButton>
						{mainCv && (
							<LinkButton href={`/api/cv/${mainCv.slug}/pdf?download=1`} size="lg" variant="outline" leadingIcon="download">
								{m.home_download_cv()}
							</LinkButton>
						)}
					</div>
				</section>

				{p.stats.length > 0 && (
					<section className="mh-grid-4" aria-label={m.home_highlights()}>
						{p.stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} />)}
					</section>
				)}

				<Projects projects={data.projects} />
				<Services services={data.services} />
				<Experience items={data.experiences} />
				<Skills skills={data.skills} projects={data.projects} roles={data.experiences} />
				<Credentials education={p.education} certifications={p.certifications} />
				<Contact profile={p} services={data.services} />
			</main>
		</>
	);
}

function Projects({ projects }: { projects: Portfolio["projects"] }) {
	const shown = homeProjects(projects);
	return (
		<section className="site-section" id="work" aria-labelledby="work-title">
			<SectionHeading
				id="work-title"
				eyebrow={m.home_projects_eyebrow()}
				title={m.nav_projects()}
				description={m.home_projects_description()}
				action={<LinkButton href={localizeHref("/projects")} variant="ghost" trailingIcon="arrow-right">{m.home_all_projects({ count: projects.length })}</LinkButton>}
			/>
			<div className="mh-grid-3">
				{shown.map((pr) => <ProjectCard key={pr.id} project={pr} />)}
			</div>
		</section>
	);
}

function Experience({ items }: { items: Portfolio["experiences"] }) {
	return (
		<section className="site-section" id="experience" aria-labelledby="exp-title">
			<SectionHeading id="exp-title" eyebrow={m.home_experience_eyebrow()} title={m.home_experience_title()} />
			<Timeline
				items={items.map((e) => ({
					meta: `${e.start} — ${e.current ? m.home_present() : e.end}`,
					title: `${e.role} · ${e.company}`,
					body: (
						<>
							{e.location && <span>{e.location}. </span>}
							{e.highlights.length > 0 && (
								<ul style={{ margin: "6px 0 0", paddingInlineStart: 18 }}>
									{e.highlights.map((h) => <li key={h}>{h}</li>)}
								</ul>
							)}
						</>
					),
				}))}
			/>
		</section>
	);
}

function Skills({ skills, projects, roles }: { skills: Portfolio["skills"]; projects: Portfolio["projects"]; roles: Portfolio["experiences"] }) {
	const groups = [...new Set(skills.map((s) => s.category))];
	return (
		<section className="site-section" id="skills" aria-labelledby="skills-title">
			<SectionHeading id="skills-title" eyebrow={m.home_skills_eyebrow()} title={m.home_skills_title()} description={m.home_skills_description()} />
			<div className="mh-grid-2">
				{groups.map((g) => (
					<div key={g} className="mh-card">
						<span className="mh-card__eyebrow">{g}</span>
						<div className="mh-skills">
							{skills.filter((s) => s.category === g).map((s) => <SkillRow key={s.id} skill={s} evidence={skillEvidence(s.name, projects, roles)} />)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

const MAX_EVIDENCE_LINKS = 3;

function SkillRow({ skill: s, evidence }: { skill: Portfolio["skills"][number]; evidence: SkillEvidence }) {
	const shownProjects = evidence.projects.slice(0, MAX_EVIDENCE_LINKS);
	const more = evidence.projects.length - shownProjects.length;
	return (
		<div className="skill-row">
			<SkillMeter skills={[s]} />
			<p className="skill-row__evidence">
				{s.years ? <span className="skill-row__years">{m.home_skill_years({ years: s.years })}</span> : null}
				{evidence.companies.length > 0 && <span>{m.home_skill_at({ companies: evidence.companies.slice(0, 3).join(", ") })}</span>}
				{shownProjects.length > 0 && (
					<span>
						{m.home_skill_in()}{" "}
						{shownProjects.map((p, i) => (
							<span key={p.slug}>
								{i > 0 && ", "}
								<Link to="/projects/$slug" params={{ slug: p.slug }}>{p.title}</Link>
							</span>
						))}
						{more > 0 && <> {m.home_skill_and()} <Link to="/projects">{m.home_skill_more({ count: more })}</Link></>}
					</span>
				)}
			</p>
		</div>
	);
}

function Credentials({ education, certifications }: { education: NonNullable<Portfolio["profile"]>["education"]; certifications: string[] }) {
	if (education.length === 0 && certifications.length === 0) return null;
	return (
		<section className="site-section" id="education" aria-labelledby="edu-title">
			<SectionHeading id="edu-title" eyebrow={m.home_credentials_eyebrow()} title={m.home_credentials_title()} />
			<div className="mh-grid-2">
				{education.length > 0 && (
					<div className="mh-card">
						<span className="mh-card__eyebrow">{m.home_education()}</span>
						<ul className="project-detail__list">
							{education.map((e) => (
								<li key={e.school}>
									<Icon name="book" size={16} />
									<span><strong>{e.degree}</strong> · {e.school}{(e.start || e.end) && <span style={{ color: "var(--text-subtle)" }}> · {[e.start, e.end].filter(Boolean).join("–")}</span>}</span>
								</li>
							))}
						</ul>
					</div>
				)}
				{certifications.length > 0 && (
					<div className="mh-card">
						<span className="mh-card__eyebrow">{m.home_certifications()}</span>
						<ul className="project-detail__list">{certifications.map((c) => <li key={c}><Icon name="award" size={16} />{c}</li>)}</ul>
					</div>
				)}
			</div>
		</section>
	);
}

function Contact({ profile, services }: { profile: NonNullable<Portfolio["profile"]>; services: Portfolio["services"] }) {
	return (
		<section className="site-section" id="contact" aria-labelledby="contact-title">
			<SectionHeading id="contact-title" eyebrow={m.common_contact_eyebrow()} title={m.home_contact_title()} description={profile.availability} />
			<div className="contact-grid">
				<ul className="contact-list">
					<li><Icon name="mail" /><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
					{profile.phone && <li><Icon name="phone" /><a href={telHref(profile.phone)}>{m.home_call({ phone: profile.phone })}</a></li>}
					{profile.phone && <li><Icon name="send" /><a href={whatsappHref(profile.phone)} target="_blank" rel="noopener noreferrer">{m.home_whatsapp_me()}</a></li>}
					{profile.location && <li><Icon name="map-pin" /><span>{profile.location}</span></li>}
					{profile.linkedin && <li><Icon name="linkedin" /><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
					{profile.github && <li><Icon name="github" /><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>}
				</ul>
				<ContactForm services={services} />
			</div>
		</section>
	);
}

function Services({ services }: { services: Portfolio["services"] }) {
	if (services.length === 0) return null;
	return (
		<section className="site-section" id="services" aria-labelledby="services-title">
			<SectionHeading id="services-title" eyebrow={m.home_services_eyebrow()} title={m.nav_services()} action={<LinkButton href={localizeHref("/services")} variant="ghost" trailingIcon="arrow-right">{m.home_all_services()}</LinkButton>} />
			<div className="mh-grid-3">
				{services.slice(0, 6).map((s) => <ServiceCard key={s.slug} service={s} />)}
			</div>
		</section>
	);
}
