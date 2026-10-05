import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CvPaper } from "#/design-system/cv-paper";
import {
	Alert,
	Badge,
	Button,
	Checkbox,
	Icon,
	IconButton,
	Input,
	LinesField,
	ProgressBar,
	Switch,
	Tabs,
	Textarea,
} from "#/design-system/ui";
import { useSave } from "#/design-system/use-save";
import type { AtsResult } from "#/server/ats";
import { CV_ACCENTS, CV_TEMPLATES, type CvData, type CvTemplate } from "#/server/cv-schema";
import { getCv, runAtsCheck, saveCv } from "#/server/fn/cv";

export const Route = createFileRoute("/admin/cvs/$id")({
	loader: ({ params }) => getCv({ data: { id: Number(params.id) } }),
	component: CvBuilder,
});

type Meta = { title: string; slug: string; template: CvTemplate; accent: string; isPublic: boolean };

function CvBuilder() {
	const { cv: row, reports } = Route.useLoaderData();
	const router = useRouter();
	const [meta, setMeta] = useState<Meta>({ title: row.title, slug: row.slug, template: row.template as CvTemplate, accent: row.accent, isPublic: row.isPublic });
	const [cv, setCv] = useState<CvData>(row.data);
	const [dirty, setDirty] = useState(false);
	const [tab, setTab] = useState<"content" | "settings" | "ats">("content");
	const save = useSave();

	const update = (patch: Partial<CvData>) => { setCv((c) => ({ ...c, ...patch })); setDirty(true); };
	const updateMeta = (patch: Partial<Meta>) => { setMeta((m) => ({ ...m, ...patch })); setDirty(true); };

	const persist = useCallback(async () => {
		const r = await save.run(() => saveCv({ data: { id: row.id, meta, data: cv } }));
		if (r && "ok" in r && r.ok) { setDirty(false); router.invalidate(); return true; }
		return false;
	}, [cv, meta, row.id, router, save]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); void persist(); } };
		const onLeave = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
		window.addEventListener("keydown", onKey);
		window.addEventListener("beforeunload", onLeave);
		return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("beforeunload", onLeave); };
	}, [persist, dirty]);

	const pdfUrl = `/api/cv/${row.slug}/pdf`;
	async function downloadPdf() {
		if (dirty && !(await persist())) return;
		window.open(`/api/cv/${meta.slug}/pdf?download=1`, "_blank", "noopener");
	}

	return (
		<>
			<div className="admin-page-head">
				<div>
					<Link to="/admin/cvs" className="mh-link" style={{ fontSize: 13 }}>← All CVs</Link>
					<h1>{meta.title}</h1>
					<p className="mh-row" style={{ gap: 8 }}>
						<Badge variant={meta.isPublic ? "success" : "neutral"} dot={meta.isPublic}>{meta.isPublic ? "Public PDF" : "Private"}</Badge>
						<span>{dirty ? "Unsaved changes" : save.saved ? "Saved" : "All changes saved"}</span>
					</p>
				</div>
				<div className="cvb__toolbar">
					<a className="mh-btn mh-btn--outline mh-btn--sm" href={pdfUrl} target="_blank" rel="noopener noreferrer"><Icon name="eye" size={16} />Open PDF</a>
					<Button size="sm" variant="secondary" leadingIcon="download" onClick={downloadPdf}>Download PDF</Button>
					<Button size="sm" loading={save.saving} onClick={persist} disabled={!dirty && !save.saving}>Save <kbd className="mh-kbd-inline" style={{ marginLeft: 4 }}>⌘S</kbd></Button>
				</div>
			</div>
			{save.error && <Alert variant="danger" title="Not saved">{save.error}{Object.keys(save.fieldErrors).length > 0 && <> ({Object.entries(save.fieldErrors).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join("; ")})</>}</Alert>}

			<Tabs label="CV sections" value={tab} onChange={setTab} items={[{ id: "content", label: "Content" }, { id: "settings", label: "Design & sharing" }, { id: "ats", label: "ATS check", count: reports.length || undefined }]} />

			<div className="cvb">
				<div className="cvb__editor">
					{tab === "content" && <ContentEditor cv={cv} update={update} />}
					{tab === "settings" && <SettingsEditor meta={meta} update={updateMeta} savedSlug={row.slug} savedPublic={row.isPublic} />}
					{tab === "ats" && <AtsPanel cvId={row.id} cv={cv} reports={reports} onDone={() => router.invalidate()} />}
				</div>
				<section className="cvb__preview" aria-label="Live preview">
					<div className="mh-row mh-row--between"><span className="mh-card__eyebrow">Live preview</span><span style={{ fontSize: 12, color: "var(--text-subtle)" }}>The PDF uses the same content in one ATS-friendly column.</span></div>
					<CvPaper cv={cv} template={meta.template} accent={meta.accent} />
				</section>
			</div>
		</>
	);
}

/* ── Content ── */
function Section({ title, icon, count, children, defaultOpen = true }: { title: string; icon: Parameters<typeof Icon>[0]["name"]; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<section className="mh-seced">
			<header className="mh-seced__head">
				<span className="mh-seced__icon" aria-hidden><Icon name={icon} size={16} /></span>
				<h3 className="mh-seced__title">
					<button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
						{title}{count != null && <span className="mh-tab__count">{count}</span>}<Icon name="chevron-down" size={16} />
					</button>
				</h3>
			</header>
			{open && <div className="mh-seced__body">{children}</div>}
		</section>
	);
}

function moveItem<T>(arr: T[], i: number, d: number): T[] {
	const j = i + d;
	if (j < 0 || j >= arr.length) return arr;
	const next = arr.slice();
	[next[i], next[j]] = [next[j], next[i]];
	return next;
}

function ListItem({ title, sub, onUp, onDown, onRemove, children }: { title: string; sub?: string; onUp?: () => void; onDown?: () => void; onRemove: () => void; children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	return (
		<div className={`mh-repeat__item${open ? " mh-repeat__item--open" : ""}`}>
			<div className="mh-repeat__head">
				<button type="button" className="mh-repeat__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
					<span className="mh-repeat__title">{title || "Untitled"}</span>
					{sub && <span className="mh-repeat__sub">{sub}</span>}
				</button>
				<IconButton icon="arrow-up" label="Move up" size="sm" disabled={!onUp} onClick={onUp} />
				<IconButton icon="arrow-down" label="Move down" size="sm" disabled={!onDown} onClick={onDown} />
				<IconButton icon="trash" label="Remove" size="sm" onClick={onRemove} />
			</div>
			{open && <div className="mh-repeat__body form-grid">{children}</div>}
		</div>
	);
}

function ContentEditor({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
	const field = (k: "name" | "title" | "email" | "phone" | "location" | "website" | "linkedin" | "github", label: string, type = "text") => (
		<Input label={label} type={type} value={cv[k]} onChange={(e) => update({ [k]: e.target.value })} />
	);
	const setExp = (i: number, p: Partial<CvData["experience"][number]>) => update({ experience: cv.experience.map((x, j) => (j === i ? { ...x, ...p } : x)) });
	const setEdu = (i: number, p: Partial<CvData["education"][number]>) => update({ education: cv.education.map((x, j) => (j === i ? { ...x, ...p } : x)) });
	const setProj = (i: number, p: Partial<CvData["projects"][number]>) => update({ projects: cv.projects.map((x, j) => (j === i ? { ...x, ...p } : x)) });
	const setSkill = (i: number, p: Partial<CvData["skills"][number]>) => update({ skills: cv.skills.map((x, j) => (j === i ? { ...x, ...p } : x)) });

	return (
		<>
			<Section title="Header" icon="user">
				<div className="form-grid-2">{field("name", "Full name")}{field("title", "Headline")}{field("email", "Email", "email")}{field("phone", "Phone", "tel")}{field("location", "Location")}{field("website", "Website")}{field("linkedin", "LinkedIn URL")}{field("github", "GitHub URL")}</div>
			</Section>
			<Section title="Summary" icon="edit">
				<Textarea label="Summary" rows={5} value={cv.summary} onChange={(e) => update({ summary: e.target.value })} hint={`${cv.summary.length} characters · 2–4 sentences naming your role, years and strongest skills.`} />
			</Section>
			<Section title="Experience" icon="briefcase" count={cv.experience.length}>
				<div className="mh-repeat">
					{cv.experience.map((x, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: CV entries have no ids; inputs are fully controlled
						<ListItem key={i} title={`${x.role}${x.company ? ` · ${x.company}` : ""}`} sub={[x.start, x.current ? "Present" : x.end].filter(Boolean).join(" – ")}
							onUp={i ? () => update({ experience: moveItem(cv.experience, i, -1) }) : undefined}
							onDown={i < cv.experience.length - 1 ? () => update({ experience: moveItem(cv.experience, i, 1) }) : undefined}
							onRemove={() => update({ experience: cv.experience.filter((_, j) => j !== i) })}>
							<div className="form-grid-2">
								<Input label="Role" value={x.role} onChange={(e) => setExp(i, { role: e.target.value })} />
								<Input label="Company" value={x.company} onChange={(e) => setExp(i, { company: e.target.value })} />
								<Input label="Location" value={x.location} onChange={(e) => setExp(i, { location: e.target.value })} />
								<div />
								<Input label="Start" placeholder="Sep 2025" value={x.start} onChange={(e) => setExp(i, { start: e.target.value })} />
								<Input label="End" disabled={x.current} value={x.current ? "" : x.end} onChange={(e) => setExp(i, { end: e.target.value })} />
							</div>
							<Checkbox label="Current role" checked={x.current} onChange={(e) => setExp(i, { current: e.target.checked })} />
							<LinesField label="Bullets" rows={5} value={x.bullets} onChange={(bullets) => setExp(i, { bullets })} hint="One per line. Start with a verb (Led, Built, Reduced) and include a number." />
						</ListItem>
					))}
					<Button variant="outline" leadingIcon="plus" block onClick={() => update({ experience: [{ role: "", company: "", location: "", start: "", end: "", current: false, bullets: [] }, ...cv.experience] })}>Add role</Button>
				</div>
			</Section>
			<Section title="Projects" icon="layers" count={cv.projects.length} defaultOpen={false}>
				<div className="mh-repeat">
					{cv.projects.map((p, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: CV entries have no ids; inputs are fully controlled
						<ListItem key={i} title={p.name} sub={p.tech.join(", ")}
							onUp={i ? () => update({ projects: moveItem(cv.projects, i, -1) }) : undefined}
							onDown={i < cv.projects.length - 1 ? () => update({ projects: moveItem(cv.projects, i, 1) }) : undefined}
							onRemove={() => update({ projects: cv.projects.filter((_, j) => j !== i) })}>
							<div className="form-grid-2"><Input label="Name" value={p.name} onChange={(e) => setProj(i, { name: e.target.value })} /><Input label="URL" value={p.url} onChange={(e) => setProj(i, { url: e.target.value })} /></div>
							<Textarea label="Description" rows={3} value={p.description} onChange={(e) => setProj(i, { description: e.target.value })} />
							<LinesField label="Tech" rows={2} value={p.tech} onChange={(tech) => setProj(i, { tech })} />
						</ListItem>
					))}
					<Button variant="outline" leadingIcon="plus" block onClick={() => update({ projects: [...cv.projects, { name: "", description: "", tech: [], url: "" }] })}>Add project</Button>
				</div>
			</Section>
			<Section title="Skills" icon="zap" count={cv.skills.length}>
				<div className="mh-repeat">
					{cv.skills.map((g, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: CV entries have no ids; inputs are fully controlled
						<ListItem key={i} title={g.name} sub={g.items.slice(0, 6).join(", ")}
							onUp={i ? () => update({ skills: moveItem(cv.skills, i, -1) }) : undefined}
							onDown={i < cv.skills.length - 1 ? () => update({ skills: moveItem(cv.skills, i, 1) }) : undefined}
							onRemove={() => update({ skills: cv.skills.filter((_, j) => j !== i) })}>
							<Input label="Group" value={g.name} onChange={(e) => setSkill(i, { name: e.target.value })} />
							<LinesField label="Skills" rows={4} value={g.items} onChange={(items) => setSkill(i, { items })} />
						</ListItem>
					))}
					<Button variant="outline" leadingIcon="plus" block onClick={() => update({ skills: [...cv.skills, { name: "Skills", items: [] }] })}>Add skill group</Button>
				</div>
			</Section>
			<Section title="Education" icon="book" count={cv.education.length} defaultOpen={cv.education.length === 0}>
				<div className="mh-repeat">
					{cv.education.map((e, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: CV entries have no ids; inputs are fully controlled
						<ListItem key={i} title={e.degree} sub={e.school} onRemove={() => update({ education: cv.education.filter((_, j) => j !== i) })}
							onUp={i ? () => update({ education: moveItem(cv.education, i, -1) }) : undefined}
							onDown={i < cv.education.length - 1 ? () => update({ education: moveItem(cv.education, i, 1) }) : undefined}>
							<div className="form-grid-2">
								<Input label="Degree" value={e.degree} onChange={(ev) => setEdu(i, { degree: ev.target.value })} />
								<Input label="School" value={e.school} onChange={(ev) => setEdu(i, { school: ev.target.value })} />
								<Input label="Start" value={e.start} onChange={(ev) => setEdu(i, { start: ev.target.value })} />
								<Input label="End" value={e.end} onChange={(ev) => setEdu(i, { end: ev.target.value })} />
							</div>
						</ListItem>
					))}
					<Button variant="outline" leadingIcon="plus" block onClick={() => update({ education: [...cv.education, { degree: "", school: "", start: "", end: "" }] })}>Add education</Button>
				</div>
			</Section>
			<Section title="Certifications & languages" icon="award" defaultOpen={false}>
				<LinesField label="Certifications" rows={3} value={cv.certifications} onChange={(certifications) => update({ certifications })} />
				<LinesField
					label="Languages"
					hint="One per line as Language — Level, e.g. Arabic — Native."
					rows={3}
					value={cv.languages.map((l) => (l.level ? `${l.name} — ${l.level}` : l.name))}
					onChange={(lines) => update({ languages: lines.map((s) => { const [name, level = ""] = s.split(/\s+[—-]\s+/); return { name: name ?? "", level }; }) })}
				/>
			</Section>
		</>
	);
}

/* ── Settings ── */
function SettingsEditor({ meta, update, savedSlug, savedPublic }: { meta: Meta; update: (p: Partial<Meta>) => void; savedSlug: string; savedPublic: boolean }) {
	const [copied, setCopied] = useState(false);
	const origin = typeof window === "undefined" ? "" : window.location.origin;
	const publicUrl = `${origin}/api/cv/${savedSlug}/pdf`;
	return (
		<>
			<section className="mh-card" style={{ gap: 16 }}>
				<Input label="CV title" value={meta.title} onChange={(e) => update({ title: e.target.value })} hint="Only you see this." />
				<Input label="Link name" value={meta.slug} onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} hint={`Your PDF lives at /api/cv/${meta.slug || "…"}/pdf`} />
			</section>
			<section className="mh-card" style={{ gap: 16 }}>
				<span className="mh-field__label" aria-hidden>Template</span>
				<fieldset className="mh-templates" style={{ border: 0, padding: 0, margin: 0 }}>
					<legend className="mh-sr">CV template</legend>
					{CV_TEMPLATES.map((t) => (
						<label key={t} className="mh-template" data-checked={meta.template === t}>
							<input type="radio" name="cv-template" className="mh-sr" checked={meta.template === t} onChange={() => update({ template: t })} />
							<span className="mh-template__thumb" aria-hidden><img src={`/brand/templates/cv-${t}.svg`} alt="" /></span>
							<span className="mh-template__label">{t[0].toUpperCase() + t.slice(1)}</span>
						</label>
					))}
				</fieldset>
				<span className="mh-field__label" aria-hidden>Accent colour</span>
				<fieldset className="mh-swatches" style={{ border: 0, padding: 0, margin: 0 }}>
					<legend className="mh-sr">Accent colour</legend>
					{CV_ACCENTS.map((a) => (
						<label key={a.value} className="mh-swatch" title={a.label} data-checked={meta.accent === a.value} style={{ "--mh-swatch": a.value } as React.CSSProperties}>
							<input type="radio" name="cv-accent" className="mh-sr" checked={meta.accent === a.value} onChange={() => update({ accent: a.value })} />
							<span className="mh-sr">{a.label}</span>
							{meta.accent === a.value && <Icon name="check" size={14} />}
						</label>
					))}
				</fieldset>
				<span className="mh-field__hint">Every template is a single column of real text, so applicant tracking systems read it in order.</span>
			</section>
			<section className="mh-card" style={{ gap: 12 }}>
				<Switch label="Public PDF link" checked={meta.isPublic} onChange={(e) => update({ isPublic: e.target.checked })} />
				<span className="mh-field__hint">When on, anyone with the link can download this CV. It's always built from the latest saved version, and your site's "Download CV" button uses your newest public CV.</span>
				{savedPublic ? (
					<div className="mh-row" style={{ gap: 8, flexWrap: "nowrap" }}>
						<input className="mh-input" readOnly value={publicUrl} aria-label="Public PDF URL" onFocus={(e) => e.currentTarget.select()} />
						<Button size="sm" variant="outline" leadingIcon={copied ? "check" : "copy"} onClick={async () => { await navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "Copied" : "Copy"}</Button>
					</div>
				) : (
					meta.isPublic && <Alert variant="info">Save to publish the link.</Alert>
				)}
				<span className="mh-field__hint">Options: <code>?template=classic</code>, <code>&amp;accent=2366a8</code>, <code>&amp;download=1</code>.</span>
			</section>
		</>
	);
}

/* ── ATS ── */
function AtsPanel({ cvId, cv, reports, onDone }: { cvId: number; cv: CvData; reports: { id: number; jobTitle: string; score: number; createdAt: Date | string; result: AtsResult; jobDescription: string }[]; onDone: () => void }) {
	const [jobTitle, setJobTitle] = useState(reports[0]?.jobTitle ?? "");
	const [jd, setJd] = useState(reports[0]?.jobDescription ?? "");
	const [result, setResult] = useState<AtsResult | null>(reports[0]?.result ?? null);
	const save = useSave();

	async function check(e: React.FormEvent) {
		e.preventDefault();
		const r = await save.run(() => runAtsCheck({ data: { cvId, jobTitle, jobDescription: jd, data: cv } }));
		if (r) { setResult(r); onDone(); }
	}

	return (
		<>
			<form className="mh-card form-grid" onSubmit={check}>
				<p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>Paste the job ad. The checker compares it with this CV as currently edited (saved or not) and saves a report.</p>
				{save.error && <Alert variant="danger">{save.fieldErrors.jobDescription ?? save.error}</Alert>}
				<Input label="Job title" placeholder="Tech Lead – Acme" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
				<Textarea label="Job description" rows={8} required value={jd} onChange={(e) => setJd(e.target.value)} error={save.fieldErrors.jobDescription} />
				<div><Button type="submit" leadingIcon="sparkles" loading={save.saving}>Check CV against this job</Button></div>
			</form>
			{result && <AtsResultView r={result} />}
			{reports.length > 1 && (
				<section className="mh-card">
					<span className="mh-card__eyebrow">History</span>
					<div className="admin-list">
						{reports.map((r) => (
							<button key={r.id} type="button" className="admin-row" style={{ cursor: "pointer", textAlign: "start", font: "inherit", color: "inherit" }} onClick={() => { setResult(r.result); setJobTitle(r.jobTitle); setJd(r.jobDescription); }}>
								<span className="admin-row__main"><span className="admin-row__title">{r.jobTitle || "Untitled job"}</span><span className="admin-row__sub" style={{ display: "block" }}>{new Date(r.createdAt).toLocaleString()}</span></span>
								<Badge variant={r.score >= 70 ? "success" : r.score >= 50 ? "warning" : "danger"}>{r.score}/100</Badge>
							</button>
						))}
					</div>
				</section>
			)}
		</>
	);
}

function AtsResultView({ r }: { r: AtsResult }) {
	return (
		<section className="mh-card" style={{ gap: 16 }} aria-live="polite">
			<div className="ats-score">
				<strong>{r.score}</strong>
				<div><div style={{ fontWeight: 600 }}>{r.grade}</div><div style={{ color: "var(--text-muted)", fontSize: 13 }}>out of 100 · {r.wordCount} words</div></div>
			</div>
			<div className="ats-checks">
				{r.checks.map((c) => (
					<div key={c.id}>
						<ProgressBar label={`${c.label} · ${c.score}/${c.max}`} value={(c.score / c.max) * 100} />
						<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{c.detail}</div>
					</div>
				))}
			</div>
			{(r.matchedKeywords.length > 0 || r.missingKeywords.length > 0) && (
				<div style={{ display: "grid", gap: 8 }}>
					<span className="mh-field__label">Keywords</span>
					<div className="kw">
						{r.matchedKeywords.map((k) => <span key={k} className="mh-chip mh-chip--active"><Icon name="check" size={12} />{k}</span>)}
						{r.missingKeywords.map((k) => <span key={k} className="mh-chip mh-chip--miss"><Icon name="x" size={12} />{k}</span>)}
					</div>
				</div>
			)}
			{r.suggestions.length > 0 && (
				<div>
					<span className="mh-field__label">What to improve</span>
					<ul style={{ margin: "6px 0 0", paddingInlineStart: 18, display: "grid", gap: 4 }}>{r.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
				</div>
			)}
		</section>
	);
}
