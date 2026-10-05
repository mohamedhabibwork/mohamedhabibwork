import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
	Alert,
	Button,
	ChipList,
	Icon,
	Input,
	LinkButton,
	Logo,
	MarkArt,
	SectionHeading,
	SkillMeter,
	StatCard,
	Textarea,
	ThemeToggle,
	Timeline,
} from "#/design-system/ui";
import { absoluteUrl, jsonLd, SITE_URL, seo } from "#/lib/seo";
import { getPortfolio, sendMessage } from "#/server/fn/public";

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

const NAV = [
	{ href: "#work", label: "Work" },
	{ href: "#experience", label: "Experience" },
	{ href: "#skills", label: "Skills" },
	{ href: "#contact", label: "Contact" },
];

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
			<header className="site-header">
				<div className="site site-header__inner">
					<Logo size={26} href="/" />
					<nav className="site-nav" aria-label="Sections">
						{NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
					</nav>
					<ThemeToggle />
					<LinkButton href="#contact" size="sm">Hire me</LinkButton>
				</div>
			</header>

			<main id="main" className="site">
				<section className="mh-hero" aria-labelledby="hero-title">
					<MarkArt className="mh-hero__art" position="right" />
					<div className="mh-row" style={{ gap: 16 }}>
						<Logo variant="mark" size={112} />
						<span className="mh-hero__eyebrow">{p.availability || p.location}</span>
					</div>
					<h1 className="mh-hero__title" id="hero-title">
						{p.headline.replace(/&.*$/, "").trim()} <em>& team leader.</em>
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
				<Experience items={data.experiences} />
				<Skills skills={data.skills} />
				<Contact profile={p} />
			</main>

			<footer className="site" style={{ marginTop: 72 }}>
				<div className="mh-footer">
					<div className="mh-footer__bottom" style={{ borderTop: 0, paddingTop: 0 }}>
						<span>© {new Date().getFullYear()} {p.name}</span>
						<span className="mh-row" style={{ gap: 4 }}>
							{p.github && <a className="mh-iconbtn" href={p.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer"><Icon name="github" /></a>}
							{p.linkedin && <a className="mh-iconbtn" href={p.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Icon name="linkedin" /></a>}
							<a className="mh-iconbtn" href={`mailto:${p.email}`} aria-label="Email"><Icon name="mail" /></a>
						</span>
					</div>
				</div>
			</footer>
		</>
	);
}

function Projects({ projects }: { projects: Portfolio["projects"] }) {
	const [showAll, setShowAll] = useState(false);
	const shown = showAll ? projects : projects.filter((x) => x.featured).slice(0, 6);
	return (
		<section className="site-section" id="work" aria-labelledby="work-title">
			<SectionHeading
				id="work-title"
				eyebrow="Selected work"
				title="Projects"
				description="Platforms I've built and led across transportation, healthcare, fintech and more."
				action={projects.length > shown.length || showAll ? <Button variant="ghost" trailingIcon={showAll ? "chevron-up" : "arrow-right"} onClick={() => setShowAll(!showAll)}>{showAll ? "Show featured" : `All ${projects.length} projects`}</Button> : undefined}
			/>
			<div className="mh-grid-3">
				{shown.map((pr) => {
					return (
						<Link key={pr.id} className="mh-project" to="/projects/$slug" params={{ slug: pr.slug }}>
							<div className="mh-project__media">
								<img src={pr.imageUrl || `/og/projects/${pr.slug}.svg`} alt="" loading="lazy" width={1200} height={630} />
							</div>
							<div className="mh-project__body">
								<div className="mh-project__meta"><span>{pr.category}</span><span>{pr.year}</span></div>
								<h3 className="mh-project__title">{pr.title}<Icon name="arrow-right" size={16} /></h3>
								<p className="mh-project__desc">{pr.summary}</p>
								<ChipList items={pr.tech} label="Stack" />
							</div>
						</Link>
					);
				})}
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

function Contact({ profile }: { profile: NonNullable<Portfolio["profile"]> }) {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState("");

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget;
		const fd = new FormData(form);
		const input = Object.fromEntries(fd.entries());
		setState("sending");
		setErrors({});
		setFormError("");
		try {
			await sendMessage({ data: input });
			setState("sent");
			form.reset();
		} catch (err) {
			setState("idle");
			const issues = parseIssues(err);
			if (issues) setErrors(issues);
			else setFormError("Couldn't send your message. Please email me directly instead.");
		}
	}

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
				<form className="mh-card form-grid" onSubmit={onSubmit} noValidate>
					{state === "sent" && <Alert variant="success" title="Message sent">Thanks! I'll reply within a day.</Alert>}
					{formError && <Alert variant="danger" title="Not sent">{formError}</Alert>}
					<div className="form-grid-2">
						<Input name="name" label="Name" required autoComplete="name" error={errors.name} />
						<Input name="email" type="email" label="Email" required autoComplete="email" error={errors.email} />
					</div>
					<Input name="subject" label="Subject" error={errors.subject} />
					<Textarea name="body" label="Message" required rows={5} error={errors.body} />
					<div className="hp" aria-hidden>
						<label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
					</div>
					<div><Button type="submit" loading={state === "sending"} trailingIcon="send">Send message</Button></div>
				</form>
			</div>
		</section>
	);
}

/** Maps a zod validation error from a server function to field messages. */
function parseIssues(err: unknown): Record<string, string> | null {
	try {
		const msg = err instanceof Error ? err.message : String(err);
		const issues = JSON.parse(msg) as { path: (string | number)[]; message: string }[];
		if (!Array.isArray(issues)) return null;
		return Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]));
	} catch {
		return null;
	}
}
