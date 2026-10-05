import { createFileRoute, } from "@tanstack/react-router";
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
import { absoluteUrl, jsonLd, SITE_URL, seo } from "#/lib/seo";
import { ProjectCard, ServiceCard } from "#/components/cards";
import { ContactForm, SiteFooter, SiteHeader } from "#/components/site";
import { getPortfolio } from "#/server/fn/public";

export const Route = createFileRoute("/")({
	loader: () => getPortfolio(),
	head: ({ loaderData }) => {
		const p = loaderData?.profile;
		const base = seo({
			title: p ? `${p.name} · ${p.headline}` : "Mohamed Habib · Senior Full Stack Developer",
			description: p?.summary.slice(0, 160) || "Senior full stack developer and team leader.",
			path: "/",
			type: "profile",
		});
		if (!p) return base;
		const person = {
			"@context": "https://schema.org",
			"@type": "Person",
			name: p.name,
			jobTitle: p.headline,
			description: p.summary,
			email: `mailto:${p.email}`,
			url: SITE_URL,
			image: absoluteUrl("/icon-512.png"),
			address: p.location,
			sameAs: [p.github, p.linkedin].filter(Boolean),
			knowsAbout: [...new Set(loaderData.skills.map((s) => s.name))],
		};
		const site = { "@context": "https://schema.org", "@type": "WebSite", name: p.name, url: SITE_URL };
		return { ...base, scripts: [jsonLd(person), jsonLd(site)] };
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
				<Alert variant="info" title="No profile yet">Run <code>bun run db:seed</code> or fill in your profile in the dashboard.</Alert>
			</main>
		);
	}
	const mainCv = data.publicCvs[0];
	return (
		<>
			<SiteHeader />

			<main id="main" className="site">
				<section className="mh-hero" aria-labelledby="hero-title">
					<MarkArt className="mh-hero__art" position="right" />
					<div className="mh-row" style={{ gap: 16 }}>
						<Logo variant="mark" size={112} />
						<span className="mh-hero__eyebrow">{p.availability || p.location}</span>
					</div>
					<h1 className="mh-hero__title" id="hero-title">
						{p.headline.split(/[·|&]/)[0].trim()} <em>& team leader.</em>
					</h1>
					<p className="mh-hero__lead">{p.tagline}</p>
					<div className="mh-hero__actions">
						<LinkButton href="#work" size="lg" trailingIcon="arrow-right">See my work</LinkButton>
						{mainCv && (
							<LinkButton href={`/api/cv/${mainCv.slug}/pdf?download=1`} size="lg" variant="outline" leadingIcon="download">
								Download CV
							</LinkButton>
						)}
					</div>
				</section>

				{p.stats.length > 0 && (
					<section className="mh-grid-4" aria-label="Highlights">
						{p.stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} />)}
					</section>
				)}

				<Projects projects={data.projects} />
				<Services services={data.services} />
				<Experience items={data.experiences} />
				<Skills skills={data.skills} />
				<Credentials education={p.education} certifications={p.certifications} />
				<Contact profile={p} services={data.services} />
			</main>

			<SiteFooter owner={p} />
		</>
	);
}

function Projects({ projects }: { projects: Portfolio["projects"] }) {
	const featured = projects.filter((x) => x.featured).slice(0, 6);
	const shown = featured.length > 0 ? featured : projects.slice(0, 6);
	return (
		<section className="site-section" id="work" aria-labelledby="work-title">
			<SectionHeading
				id="work-title"
				eyebrow="Selected work"
				title="Projects"
				description="Platforms I've built and led across transportation, healthcare, fintech and more."
				action={<LinkButton href="/projects" variant="ghost" trailingIcon="arrow-right">All {projects.length} projects</LinkButton>}
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
			<SectionHeading id="exp-title" eyebrow="Career" title="Experience" />
			<Timeline
				items={items.map((e) => ({
					meta: `${e.start} — ${e.current ? "Present" : e.end}`,
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

function Skills({ skills }: { skills: Portfolio["skills"] }) {
	const groups = [...new Set(skills.map((s) => s.category))];
	return (
		<section className="site-section" id="skills" aria-labelledby="skills-title">
			<SectionHeading id="skills-title" eyebrow="Toolbox" title="Skills" />
			<div className="mh-grid-2">
				{groups.map((g) => (
					<div key={g} className="mh-card">
						<span className="mh-card__eyebrow">{g}</span>
						<SkillMeter skills={skills.filter((s) => s.category === g)} />
					</div>
				))}
			</div>
		</section>
	);
}
function Credentials({ education, certifications }: { education: NonNullable<Portfolio["profile"]>["education"]; certifications: string[] }) {
	if (education.length === 0 && certifications.length === 0) return null;
	return (
		<section className="site-section" id="education" aria-labelledby="edu-title">
			<SectionHeading id="edu-title" eyebrow="Background" title="Education & certifications" />
			<div className="mh-grid-2">
				{education.length > 0 && (
					<div className="mh-card">
						<span className="mh-card__eyebrow">Education</span>
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
						<span className="mh-card__eyebrow">Certifications</span>
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
			<SectionHeading id="contact-title" eyebrow="Contact" title="Let's build something" description={profile.availability} />
			<div className="contact-grid">
				<ul className="contact-list">
					<li><Icon name="mail" /><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
					{profile.phone && <li><Icon name="phone" /><a href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">{profile.phone} (WhatsApp)</a></li>}
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
			<SectionHeading id="services-title" eyebrow="What I do" title="Services" action={<LinkButton href="/services" variant="ghost" trailingIcon="arrow-right">All services</LinkButton>} />
			<div className="mh-grid-3">
				{services.slice(0, 6).map((s) => <ServiceCard key={s.slug} service={s} />)}
			</div>
		</section>
	);
}
