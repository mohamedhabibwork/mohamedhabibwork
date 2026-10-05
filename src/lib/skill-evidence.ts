/**
 * Links each skill to the projects and roles whose tech stack uses it, so the
 * Skills section shows where a skill was applied instead of a bare rating.
 */

/** Stack names that mean a skill even though the words differ. Keys are lowercased skill names. */
const ALIASES: Record<string, string[]> = {
	"ci/cd": ["ci/cd", "github actions", "gitlab ci"],
	"payment gateways": ["fawry", "paymob", "paypal", "stripe"],
	"real-time systems (websocket)": ["websocket", "socket.io", "socket programming"],
	"javascript / typescript": ["javascript", "typescript", "node.js", "react", "vue.js"],
	"html5 & css3": ["html", "css", "tailwind"],
	"system design": ["microservices", "kafka", "rabbitmq"],
	microservices: ["microservices"],
	"team leadership": ["team lead", "team leader", "led a team"],
	"agile / scrum": ["scrum", "agile"],
};

const MIN_TOKEN_LENGTH = 3;
const SHORT_TOKENS = new Set(["c#", "go"]);

/** Lowercased search terms for a skill: explicit aliases, else the parts of its name. */
function termsFor(skill: string): string[] {
	const key = skill.toLowerCase().trim();
	if (key in ALIASES) return ALIASES[key];
	return key
		.split(/\s*(?:[&,()]|\s\/\s)\s*/)
		.map((t) => t.trim())
		.filter((t) => t.length >= MIN_TOKEN_LENGTH || SHORT_TOKENS.has(t));
}

function usesSkill(stack: string[], terms: string[]): boolean {
	const lowered = stack.map((t) => t.toLowerCase());
	return terms.some((term) => lowered.some((t) => t === term || t.includes(term) || (t.length >= MIN_TOKEN_LENGTH && term.includes(t))));
}

/** For aliased skills the evidence is often prose ("Integrated Fawry…"), so search descriptions too. */
function mentions(text: string, terms: string[]): boolean {
	const lowered = text.toLowerCase();
	return terms.some((term) => lowered.includes(term));
}

type ProjectRef = { slug: string; title: string; tech: string[]; summary: string; features: string[] };
type RoleRef = { company: string; role: string; tech: string[]; highlights: string[] };

export type SkillEvidence = { projects: { slug: string; title: string }[]; companies: string[] };

export function skillEvidence(skill: string, projects: ProjectRef[], roles: RoleRef[]): SkillEvidence {
	const terms = termsFor(skill);
	if (terms.length === 0) return { projects: [], companies: [] };
	const prose = skill.toLowerCase().trim() in ALIASES;
	const projectMatch = (p: ProjectRef) => usesSkill(p.tech, terms) || (prose && mentions([p.summary, ...p.features].join(" "), terms));
	const roleMatch = (r: RoleRef) => usesSkill(r.tech, terms) || (prose && mentions([r.role, ...r.highlights].join(" "), terms));
	return {
		projects: projects.filter(projectMatch).map(({ slug, title }) => ({ slug, title })),
		companies: [...new Set(roles.filter(roleMatch).map((r) => r.company))],
	};
}
