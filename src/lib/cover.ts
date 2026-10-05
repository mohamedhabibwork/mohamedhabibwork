/** Brand-coloured cover art for a project, generated from its data (no stored image needed). */
type CoverInput = { title: string; subtitle: string; category: string; year: string; tech: string[] };

const W = 1200;
const H = 630;
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Stable 0..1 value from a string, so each project gets its own mark placement. */
function seed(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return ((h >>> 0) % 1000) / 1000;
}

export function projectCoverSvg(p: CoverInput): string {
	const r = seed(p.title);
	const ring = 260 + Math.round(r * 120);
	const cx = 880 + Math.round(r * 160);
	const cy = 140 + Math.round(r * 260);
	const initials = p.title.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
	const tech = p.tech.slice(0, 4).map((t, i) => {
		const x = 80 + i * 250;
		return `<g transform="translate(${x} 520)"><rect width="230" height="48" rx="24" fill="#14170f" stroke="#4b6316"/><text x="115" y="31" text-anchor="middle" font-size="20" fill="#c2f852">${esc(clip(t, 18))}</text></g>`;
	});
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Barlow, Poppins, system-ui, sans-serif">
<rect width="${W}" height="${H}" fill="#0b0d0a"/>
<circle cx="${cx}" cy="${cy}" r="${ring}" fill="#232c10"/>
<circle cx="${cx}" cy="${cy}" r="${ring - 70}" fill="none" stroke="#4b6316" stroke-width="2"/>
<text x="${cx}" y="${cy + 70}" text-anchor="middle" font-size="200" font-weight="800" fill="#c2f852" opacity="0.9">${esc(initials)}</text>
<text x="80" y="110" font-size="24" letter-spacing="4" fill="#c2f852">${esc([p.category, p.year].filter(Boolean).join(" · ").toUpperCase())}</text>
<text x="80" y="250" font-size="96" font-weight="800" fill="#f4f6ef">${esc(clip(p.title, 18))}</text>
<text x="80" y="320" font-size="36" fill="#a9b09c">${esc(clip(p.subtitle, 40))}</text>
<text x="80" y="440" font-size="22" fill="#a9b09c">Mohamed Habib · Senior Full Stack Developer</text>
${tech.join("\n")}
</svg>`;
}
