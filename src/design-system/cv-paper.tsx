import type { CvData, CvTemplate } from "#/server/cv-schema";

/** On-screen CV paper (design system CvPreview). Always print colours; the PDF is rendered server-side. */
export function CvPaper({ cv, template, accent }: { cv: CvData; template: CvTemplate; accent: string }) {
	const contact = [cv.email, cv.phone, cv.location, cv.website, cv.linkedin, cv.github].filter(Boolean).map((c) => c.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""));
	const span = (a: string, b: string, cur?: boolean) => { const to = cur ? "Present" : b; return !to || to === a ? a : `${a} — ${to}`; };
	const sec = (title: string, body: React.ReactNode) => (
		<section className="mh-cv__sec"><h3 className="mh-cv__h">{title}</h3>{body}</section>
	);
	return (
		<article className={`mh-cv mh-cv--${template}`} style={{ "--cv-accent": accent, aspectRatio: "auto", minHeight: 600 } as React.CSSProperties} aria-label="CV preview">
			<div className="mh-cv__single">
				<header className="mh-cv__header">
					<div>
						<h2 className="mh-cv__name">{cv.name}</h2>
						<div className="mh-cv__title">{cv.title}</div>
					</div>
					<ul className="mh-cv__contact">{contact.map((c) => <li key={c}>{c}</li>)}</ul>
				</header>
				{cv.summary && sec("Summary", <p>{cv.summary}</p>)}
				{cv.experience.length > 0 && sec("Experience", cv.experience.map((x, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: entries can share company/role; order is the identity here
					<div key={`${x.company}-${x.role}-${x.start}-${i}`} className="mh-cv__item">
						<div className="mh-cv__itemhead"><strong>{x.role}</strong></div>
						<div className="mh-cv__org">{[x.company, x.location].filter(Boolean).join(", ")} · {span(x.start, x.end, x.current)}</div>
						{x.bullets.length > 0 && <ul>{x.bullets.filter(Boolean).map((b) => <li key={b}>{b}</li>)}</ul>}
					</div>
				)))}
				{cv.projects.length > 0 && sec("Projects", cv.projects.map((p) => (
					<div key={p.name} className="mh-cv__item">
						<div className="mh-cv__itemhead"><strong>{p.name}</strong></div>
						{p.description && <div>{p.description}</div>}
						{p.tech.length > 0 && <div className="mh-cv__org">{p.tech.join(", ")}</div>}
					</div>
				)))}
				{cv.skills.length > 0 && sec("Skills", <ul className="mh-cv__plain">{cv.skills.map((g) => <li key={g.name} style={{ display: "block" }}><strong>{g.name}:</strong> {g.items.join(", ")}</li>)}</ul>)}
				{cv.education.length > 0 && sec("Education", cv.education.map((e) => (
					<div key={e.degree + e.school} className="mh-cv__item"><strong>{e.degree}</strong><div className="mh-cv__org">{e.school} · {span(e.start, e.end)}</div></div>
				)))}
				{cv.certifications.length > 0 && sec("Certifications", <ul>{cv.certifications.map((c) => <li key={c}>{c}</li>)}</ul>)}
				{cv.languages.length > 0 && sec("Languages", <p>{cv.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(" · ")}</p>)}
			</div>
		</article>
	);
}
