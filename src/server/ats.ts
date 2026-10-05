import type { CvData } from "./cv-schema";

export interface AtsCheck {
	id: string;
	label: string;
	score: number;
	max: number;
	detail: string;
}

export interface AtsResult {
	score: number;
	grade: "Excellent" | "Good" | "Fair" | "Needs work";
	checks: AtsCheck[];
	matchedKeywords: string[];
	missingKeywords: string[];
	suggestions: string[];
	wordCount: number;
}

const STOPWORDS = new Set(
	`a about above across after again against all also an and any are as at be been being both but by can could did do does doing during each either etc few for from further had has have having he her here hers him his how i if in into is it its itself just least less like may me might more most must my no nor not of off on once only or other our ours out over own per please same shall she should so some such than that the their them then there these they this those through to too under until up upon us very via was we were what when where which while who whom why will with within without would you your yours
	ability able across apply applicant applicants based benefits best candidate candidates closely company competitive culture day description duties environment equal excellent experience experienced great ideal including job join knowledge looking new opportunity plus position preferred qualifications related required requirements responsibilities role salary skills strong successful team teams understanding using work working world year years
	will strong good build building built lead leading leader platform platforms engineer engineers developer developers hiring hire nice have interview interviews product products help helping drive across ensure deliver delivering own owning`.split(/\s+/),
);

/** Multi-word and punctuated tech terms that naive tokenising would break apart. */
const PHRASES = [
	"asp.net core", "asp.net", ".net", "node.js", "react native", "next.js", "nuxt.js", "vue.js", "c#", "c++",
	"ci/cd", "rest api", "restful api", "graphql", "machine learning", "system design", "unit testing",
	"test-driven development", "microservices", "event-driven", "team leadership", "project management",
	"google cloud", "aws lambda", "sql server", "postgresql", "mysql", "mongodb", "redis", "kubernetes", "docker",
	"typescript", "javascript", "laravel", "php", "python", "golang", "go", "react", "vue", "angular", "tailwind",
	"agile", "scrum", "erp", "crm", "payment gateway", "websocket", "real-time", "aws", "azure", "gcp", "linux",
];

const ACTION_VERBS = new Set(
	"led built designed developed delivered launched architected implemented improved increased reduced optimized automated migrated managed mentored scaled shipped created owned drove established integrated refactored coordinated streamlined accelerated cut grew introduced spearheaded".split(" "),
);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Whole-term match that also accepts a plural ("payment gateway" matches "payment gateways"). */
const termRe = (term: string) => new RegExp(`(^|[^a-z0-9+#.])${escapeRe(term)}(?:e?s)?($|[^a-z0-9+#])`, "i");

export function cvToText(cv: CvData): string {
	return [
		cv.name, cv.title, cv.summary,
		...cv.experience.flatMap((e) => [e.role, e.company, e.location, ...e.bullets]),
		...cv.education.flatMap((e) => [e.degree, e.school]),
		...cv.skills.flatMap((g) => [g.name, ...g.items]),
		...cv.projects.flatMap((p) => [p.name, p.description, ...p.tech]),
		...cv.certifications,
		...cv.languages.map((l) => l.name),
	].join("\n");
}

/** The terms a job description stresses most: known phrases first, then frequent meaningful words. */
export function extractKeywords(jobDescription: string, limit = 25): string[] {
	const text = jobDescription.toLowerCase();
	const found = new Map<string, number>();
	let rest = text;
	for (const p of PHRASES) {
		const re = new RegExp(termRe(p).source, "gi");
		const hits = text.match(re)?.length ?? 0;
		if (hits > 0) {
			found.set(p, hits * 3);
			rest = rest.replace(re, " ");
		}
	}
	const counts = new Map<string, number>();
	for (const w of rest.match(/[a-z][a-z0-9+#-]{2,}/g) ?? []) {
		if (STOPWORDS.has(w)) continue;
		counts.set(w, (counts.get(w) ?? 0) + 1);
	}
	for (const [w, c] of counts) if (c >= 2 || w.length >= 8) found.set(w, c);
	return [...found.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([k]) => k);
}

function grade(score: number): AtsResult["grade"] {
	if (score >= 85) return "Excellent";
	if (score >= 70) return "Good";
	if (score >= 50) return "Fair";
	return "Needs work";
}

export function analyzeCv(cv: CvData, jobDescription: string): AtsResult {
	const text = cvToText(cv);
	const words = text.split(/\s+/).filter(Boolean);
	const bullets = cv.experience.flatMap((e) => e.bullets).filter(Boolean);
	const checks: AtsCheck[] = [];
	const suggestions: string[] = [];

	// 1. Keyword coverage (40)
	const keywords = jobDescription.trim() ? extractKeywords(jobDescription) : [];
	const matched = keywords.filter((k) => termRe(k).test(text));
	const missing = keywords.filter((k) => !matched.includes(k));
	const kwScore = keywords.length ? Math.round((matched.length / keywords.length) * 40) : 20;
	checks.push({
		id: "keywords", label: "Job keywords", score: kwScore, max: 40,
		detail: keywords.length ? `${matched.length} of ${keywords.length} key terms from the job description appear in your CV.` : "Paste a job description to measure keyword match.",
	});
	if (missing.length) suggestions.push(`Work these terms into your summary, skills or bullets where they're true for you: ${missing.slice(0, 10).join(", ")}.`);

	// 2. Standard sections (15)
	const sections: [string, boolean][] = [
		["Summary", cv.summary.trim().length >= 80],
		["Experience", cv.experience.length > 0],
		["Skills", cv.skills.some((g) => g.items.length > 0)],
		["Education", cv.education.length > 0],
	];
	const present = sections.filter(([, ok]) => ok).length;
	checks.push({ id: "sections", label: "Standard sections", score: Math.round((present / sections.length) * 15), max: 15, detail: `${present} of 4: ${sections.map(([n, ok]) => `${n} ${ok ? "✓" : "✗"}`).join(", ")}.` });
	for (const [n, ok] of sections) if (!ok) suggestions.push(n === "Summary" ? "Add a 2–4 sentence summary (80+ characters) that names your role and strongest skills." : `Add a section headed "${n}"; ATS parsers look for it by that name.`);

	// 3. Contact details (10)
	const contact: [string, boolean][] = [
		["email", /.+@.+\..+/.test(cv.email)],
		["phone", cv.phone.replace(/\D/g, "").length >= 8],
		["location", cv.location.trim().length > 1],
		["LinkedIn", /linkedin\.com\//i.test(cv.linkedin) || /linkedin\.com\//i.test(cv.website)],
	];
	const contactOk = contact.filter(([, ok]) => ok).length;
	checks.push({ id: "contact", label: "Contact details", score: Math.round((contactOk / contact.length) * 10), max: 10, detail: contact.map(([n, ok]) => `${n} ${ok ? "✓" : "✗"}`).join(", ") });
	const missingContact = contact.filter(([, ok]) => !ok).map(([n]) => n);
	if (missingContact.length) suggestions.push(`Add your ${missingContact.join(", ")} to the header.`);

	// 4. Quantified results (10)
	const quantified = bullets.filter((b) => /\d/.test(b)).length;
	const qRatio = bullets.length ? quantified / bullets.length : 0;
	checks.push({ id: "metrics", label: "Quantified results", score: Math.round(Math.min(1, qRatio / 0.5) * 10), max: 10, detail: `${quantified} of ${bullets.length} bullets include a number (aim for half).` });
	if (qRatio < 0.5) suggestions.push("Add numbers to more bullets: team size, users, revenue, % faster, time saved.");

	// 5. Action verbs (10)
	const verbLed = bullets.filter((b) => ACTION_VERBS.has(b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "")).length;
	const vRatio = bullets.length ? verbLed / bullets.length : 0;
	checks.push({ id: "verbs", label: "Action verbs", score: Math.round(Math.min(1, vRatio / 0.7) * 10), max: 10, detail: `${verbLed} of ${bullets.length} bullets start with a strong verb (led, built, reduced…).` });
	if (vRatio < 0.7) suggestions.push("Start each bullet with a past-tense action verb such as Led, Built, Reduced or Shipped.");

	// 6. Length (10)
	const wc = words.length;
	const lengthScore = wc >= 350 && wc <= 1000 ? 10 : wc >= 200 && wc <= 1300 ? 6 : 2;
	checks.push({ id: "length", label: "Length", score: lengthScore, max: 10, detail: `${wc} words (350–1,000 fits one or two pages).` });
	if (wc < 350) suggestions.push("Your CV is short; add achievements to recent roles and a projects section.");
	if (wc > 1000) suggestions.push("Trim older roles to 1–2 bullets to keep the CV within two pages.");

	// 7. Readability (5)
	const longBullets = bullets.filter((b) => b.length > 220).length;
	const firstPerson = /\b(i|my|me)\b/i.test(`${bullets.join(" ")} ${cv.summary}`);
	const readScore = 5 - (longBullets > 0 ? 2 : 0) - (firstPerson ? 2 : 0);
	checks.push({ id: "readability", label: "Readability", score: Math.max(0, readScore), max: 5, detail: `${longBullets} overly long bullets; ${firstPerson ? "uses" : "avoids"} first person.` });
	if (longBullets) suggestions.push("Split bullets longer than ~2 lines.");
	if (firstPerson) suggestions.push("Drop 'I', 'my' and 'me'; start bullets with the verb.");

	const score = checks.reduce((s, c) => s + c.score, 0);
	return { score, grade: grade(score), checks, matchedKeywords: matched, missingKeywords: missing, suggestions, wordCount: wc };
}
