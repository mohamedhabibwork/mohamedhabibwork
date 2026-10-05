import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, type PDFPage, rgb } from "pdf-lib";
import barlow700 from "./fonts/Barlow-700.ttf?inline";
import barlow800 from "./fonts/Barlow-800.ttf?inline";
import poppins400 from "./fonts/Poppins-400.ttf?inline";
import poppins600 from "./fonts/Poppins-600.ttf?inline";
import type { CvData, CvTemplate } from "./cv-schema";

/*
 * Renders a CV to PDF entirely in the Worker. Single column, real text and standard headings
 * so ATS parsers read it in order. Fonts are the design system's (embedded, subset).
 */

const A4 = { w: 595.28, h: 841.89 };
const INK = rgb(0.078, 0.09, 0.059); // #14170f
const MUTED = rgb(0.337, 0.361, 0.298); // #565c4c
const LINE = rgb(0.89, 0.898, 0.863); // #e3e5dc

function dataUrlBytes(url: string): Uint8Array {
	const b64 = url.slice(url.indexOf(",") + 1);
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

function hexToRgb(hex: string) {
	const n = Number.parseInt(hex.slice(1), 16);
	return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

interface Fonts {
	body: PDFFont;
	bold: PDFFont;
	display: PDFFont;
	heading: PDFFont;
}

interface Style {
	margin: number;
	body: number;
	lead: number;
	name: number;
	sectionGap: number;
	upperName: boolean;
}

const STYLES: Record<CvTemplate, Style> = {
	modern: { margin: 46, body: 9.5, lead: 1.45, name: 26, sectionGap: 14, upperName: true },
	classic: { margin: 52, body: 10, lead: 1.45, name: 24, sectionGap: 14, upperName: false },
	compact: { margin: 38, body: 9, lead: 1.35, name: 22, sectionGap: 10, upperName: true },
};

/** Keeps characters the embedded Latin fonts can draw; swaps the rest for close equivalents. */
function clean(s: string): string {
	return s
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/[^\t\n\u0020-\u024f\u2013\u2014\u2022\u2026\u20ac\u00a3]/g, "")
		.trim();
}

class Writer {
	page!: PDFPage;
	y = 0;
	constructor(
		private doc: PDFDocument,
		private f: Fonts,
		private s: Style,
		private accent: ReturnType<typeof rgb>,
	) {
		this.addPage();
	}
	get width() {
		return A4.w - this.s.margin * 2;
	}
	addPage() {
		this.page = this.doc.addPage([A4.w, A4.h]);
		this.y = A4.h - this.s.margin;
	}
	ensure(h: number) {
		if (this.y - h < this.s.margin) this.addPage();
	}
	wrap(text: string, font: PDFFont, size: number, width: number): string[] {
		const lines: string[] = [];
		for (const para of clean(text).split("\n")) {
			let line = "";
			for (const word of para.split(/\s+/).filter(Boolean)) {
				const next = line ? `${line} ${word}` : word;
				if (font.widthOfTextAtSize(next, size) <= width) line = next;
				else {
					if (line) lines.push(line);
					line = word;
				}
			}
			lines.push(line);
		}
		return lines.filter((l, i, a) => l || i < a.length - 1);
	}
	text(text: string, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; x?: number; width?: number } = {}) {
		const font = o.font ?? this.f.body;
		const size = o.size ?? this.s.body;
		const x = o.x ?? this.s.margin;
		const lh = size * this.s.lead;
		for (const line of this.wrap(text, font, size, o.width ?? this.width - (x - this.s.margin))) {
			this.ensure(lh);
			this.y -= size;
			this.page.drawText(line, { x, y: this.y, size, font, color: o.color ?? INK });
			this.y -= lh - size;
		}
	}
	bullet(text: string) {
		const size = this.s.body;
		const indent = 11;
		const lines = this.wrap(text, this.f.body, size, this.width - indent);
		const lh = size * this.s.lead;
		lines.forEach((line, i) => {
			this.ensure(lh);
			this.y -= size;
			if (i === 0) this.page.drawText("•", { x: this.s.margin + 1, y: this.y, size, font: this.f.body, color: this.accent });
			this.page.drawText(line, { x: this.s.margin + indent, y: this.y, size, font: this.f.body, color: INK });
			this.y -= lh - size;
		});
	}
	rule(color = LINE, thickness = 0.75) {
		this.page.drawLine({ start: { x: this.s.margin, y: this.y }, end: { x: A4.w - this.s.margin, y: this.y }, thickness, color });
	}
	gap(n: number) {
		this.y -= n;
	}
	heading(label: string) {
		this.gap(this.s.sectionGap);
		this.ensure(40);
		const size = 9;
		this.y -= size;
		this.page.drawRectangle({ x: this.s.margin, y: this.y - 1, width: 3, height: size + 1, color: this.accent });
		this.page.drawText(label.toUpperCase(), { x: this.s.margin + 8, y: this.y, size, font: this.f.heading, color: this.accent });
		this.y -= 5;
		this.rule();
		this.gap(6);
	}
}

const span = (start: string, end: string, current?: boolean) => {
	const to = current ? "Present" : end;
	return !to || to === start ? start : [start, to].filter(Boolean).join(" – ");
};
const bareUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export async function renderCvPdf(cv: CvData, opts: { template: CvTemplate; accent: string; title?: string }): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	doc.registerFontkit(fontkit);
	const fonts: Fonts = {
		body: await doc.embedFont(dataUrlBytes(poppins400), { subset: true }),
		bold: await doc.embedFont(dataUrlBytes(poppins600), { subset: true }),
		display: await doc.embedFont(dataUrlBytes(barlow800), { subset: true }),
		heading: await doc.embedFont(dataUrlBytes(barlow700), { subset: true }),
	};
	const s = STYLES[opts.template];
	const accent = hexToRgb(opts.accent);
	const w = new Writer(doc, fonts, s, accent);

	doc.setTitle(opts.title ?? `${cv.name} – CV`);
	doc.setAuthor(cv.name);
	doc.setSubject(cv.title);
	doc.setKeywords(cv.skills.flatMap((g) => g.items).slice(0, 40));
	doc.setCreator("mohamedhabib.me CV builder");
	doc.setProducer("mohamedhabib.me");

	// Header
	w.text(s.upperName ? cv.name.toUpperCase() : cv.name, { font: opts.template === "classic" ? fonts.bold : fonts.display, size: s.name });
	if (cv.title) w.text(cv.title.toUpperCase(), { font: fonts.heading, size: 9.5, color: accent });
	w.gap(4);
	const contact = [cv.email, cv.phone, cv.location, ...[cv.website, cv.linkedin, cv.github].filter(Boolean).map(bareUrl)].filter(Boolean).join("  |  ");
	if (contact) w.text(contact, { size: s.body - 0.5, color: MUTED });
	w.gap(6);
	w.rule(opts.template === "classic" ? INK : accent, opts.template === "classic" ? 0.75 : 1.5);

	if (cv.summary) {
		w.heading("Summary");
		w.text(cv.summary);
	}
	if (cv.experience.length) {
		w.heading("Experience");
		cv.experience.forEach((e, i) => {
			if (i) w.gap(7);
			w.text(e.role, { font: fonts.bold, size: s.body + 0.5 });
			const org = [[e.company, e.location].filter(Boolean).join(", "), span(e.start, e.end, e.current)].filter(Boolean).join("  ·  ");
			if (org) w.text(org, { color: MUTED });
			w.gap(2);
			for (const b of e.bullets.filter(Boolean)) w.bullet(b);
		});
	}
	if (cv.projects.length) {
		w.heading("Projects");
		cv.projects.forEach((p, i) => {
			if (i) w.gap(6);
			w.text(p.url ? `${p.name}  ·  ${bareUrl(p.url)}` : p.name, { font: fonts.bold, size: s.body + 0.3 });
			if (p.description) w.text(p.description);
			if (p.tech.length) w.text(p.tech.join(", "), { color: MUTED, size: s.body - 0.5 });
		});
	}
	if (cv.skills.length) {
		w.heading("Skills");
		for (const g of cv.skills.filter((g) => g.items.length)) {
			w.text(`${g.name}: ${g.items.join(", ")}`);
			w.gap(1);
		}
	}
	if (cv.education.length) {
		w.heading("Education");
		for (const e of cv.education) {
			w.text(e.degree, { font: fonts.bold, size: s.body + 0.3 });
			w.text([e.school, span(e.start, e.end)].filter(Boolean).join("  ·  "), { color: MUTED });
			w.gap(3);
		}
	}
	if (cv.certifications.length) {
		w.heading("Certifications");
		for (const c of cv.certifications) w.bullet(c);
	}
	if (cv.languages.length) {
		w.heading("Languages");
		w.text(cv.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join("  ·  "));
	}

	const pages = doc.getPages();
	if (pages.length > 1) {
		pages.forEach((p, i) => {
			p.drawText(`${clean(cv.name)} · ${i + 1}/${pages.length}`, { x: A4.w - s.margin - 80, y: 22, size: 7.5, font: fonts.body, color: MUTED });
		});
	}
	return doc.save();
}
