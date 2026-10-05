// Seeds the portfolio with Mohamed Habib's real content (from the previous static site).
// Idempotent: replaces portfolio content, keeps messages, CVs and ATS reports.
//   bun run db:seed
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema.ts";
import { cvDataSchema } from "../src/server/cv-schema.ts";

config({ path: [".env.local", ".env"] });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const profile = {
	id: 1,
	name: "Mohamed Habib",
	headline: "Senior Full Stack Developer & Team Leader",
	tagline: "Transforming ideas into scalable digital solutions with 7+ years of enterprise development and team leadership.",
	summary:
		"Senior full stack developer and team leader with 7+ years building enterprise platforms across transportation, healthcare, fintech, e-commerce, security and education. Led teams of 5–10 developers across Egypt, Saudi Arabia and the UAE, delivering 50+ projects with real-time tracking, payment integrations and ERP/CRM systems in PHP Laravel, Node.js, Go, React, Vue and ASP.NET Core.",
	email: "mohamedhabibwork@gmail.com",
	phone: "+20 115 197 8927",
	location: "Egypt · Remote worldwide",
	website: "https://mohamedhabib.me",
	github: "https://github.com/mohamedhabibwork",
	linkedin: "https://www.linkedin.com/in/mohamedhabibwork/",
	availability: "Full-time, contract and consulting · replies within 24 hours",
	photoUrl: "/brand/marks/mh-mark.svg",
	stats: [
		{ label: "Years experience", value: "7+" },
		{ label: "Projects delivered", value: "50+" },
		{ label: "Industries served", value: "6+" },
		{ label: "Delivery success", value: "95%" },
	],
};

const experiences = [
	{ company: "backstoreEIT", role: "Senior Full Stack Developer (ASP.NET Core) & Team Leader", location: "UAE (remote)", start: "Sep 2025", end: "", current: true, summary: "Full stack delivery on EDE and SDDUMP for the UAE market.", highlights: ["Lead full stack development of the EDE and SDDUMP platforms in ASP.NET Core for UAE clients.", "Own technical architecture and delivery for a cross-functional team.", "Set code review, testing and release practices for scalable enterprise applications."], tech: ["ASP.NET Core", "C#", "SQL Server"] },
	{ company: "Mugsult", role: "Senior Full Stack Developer & Team Leader", location: "Egypt", start: "2024", end: "2025", current: false, summary: "Team1 emergency transportation platform.", highlights: ["Led development of Team1, an emergency healthcare transportation platform with real-time dispatch.", "Built real-time medical team chat and patient tracking over WebSockets.", "Coordinated hospital integrations and a team of 5+ developers."], tech: ["Laravel", "Node.js", "MySQL", "WebSocket"] },
	{ company: "Code700", role: "Senior Developer & Team Leader", location: "Riyadh, Saudi Arabia", start: "2024", end: "2024", current: false, summary: "Multi-app suite for the Saudi market.", highlights: ["Led an international team delivering Ensany, Qaff, Mozn and Cashback apps for the Saudi market in 3 months.", "Built services in Node.js, React and Python with ERPNext integration."], tech: ["Node.js", "React", "Python", "ERPNext"] },
	{ company: "Enjoy Driving", role: "Senior Full Stack Developer & Team Leader", location: "Egypt", start: "2023", end: "2024", current: false, summary: "Driver apps, agent management and store platforms.", highlights: ["Led a team of 5–10 developers building driver apps, agent management and store operations.", "Improved release cadence and user experience across three products."], tech: ["Laravel", "Vue.js", "MySQL"] },
	{ company: "Gulf Communication Company", role: "Full Stack Developer", location: "Egypt", start: "2021", end: "2023", current: false, summary: "Transportation, mapping, medical and security platforms.", highlights: ["Built TOO APP, an Uber-like ride-hailing platform with real-time GPS dispatch and Fawry/PayPal payments.", "Developed Mappy, a custom mapping engine with route optimisation and enterprise mapping APIs.", "Delivered TOO Bus school transport tracking, Too Medical rep tracking and Too Security workforce management."], tech: ["Laravel", "GoLang", "ASP.NET", "PostgreSQL", "Socket.io"] },
	{ company: "Rawabet Company", role: "Full Stack Developer", location: "Egypt", start: "2020", end: "2021", current: false, summary: "E-commerce, ERP and CRM.", highlights: ["Built multi-vendor online stores with integrated ERP, CRM and inventory management.", "Developed mobile APIs for store and delivery apps."], tech: ["Laravel", "Vue.js", "MySQL"] },
	{ company: "Early roles", role: "Full Stack Developer", location: "Egypt", start: "2018", end: "2020", current: false, summary: "Distance learning and payments.", highlights: ["Built distance-learning platforms and mobile API integrations.", "Integrated Fawry, Paymob and PayPal payment gateways."], tech: ["PHP", "Laravel", "Vue.js", "React"] },
].map((e, i) => ({ ...e, sort: i }));

/** Case-study copy for each /projects/$slug page. */
const projectDetails: Record<string, { role: string; challenge: string; description: string; outcomes: string[] }> = {
	"too-app": {
		role: "Full stack developer — backend dispatch, payments and admin",
		challenge: "Match riders to the nearest driver in real time across a busy city while keeping payments, driver payouts and ERP records consistent.",
		description: "TOO APP is a ride-hailing platform with separate passenger and driver apps, a live dispatch engine and an operations dashboard.\n\nI built the Laravel core API and the GoLang location service that ingests driver GPS pings and pushes updates over Socket.io. Payments run through Fawry and PayPal with reconciliation into the company ERP/CRM.",
		outcomes: ["Sub-second live location updates for riders and dispatchers", "Two local and international payment gateways integrated", "Single admin view for trips, drivers, payouts and support"],
	},
	team1: {
		role: "Senior full stack developer & team leader",
		challenge: "Coordinate emergency patient transport between ambulances, medical teams and hospitals where every minute matters.",
		description: "Team1 is an emergency healthcare transportation platform: dispatchers assign crews, medical teams chat in real time and hospitals see incoming patients before arrival.\n\nI led a team of 5+ developers, owned the architecture and built the WebSocket layer for live chat and patient tracking on top of Laravel and Node.js.",
		outcomes: ["Real-time dispatch and crew status", "Live medical team chat and patient tracking", "Hospital integrations for incoming-patient handover"],
	},
	mappy: {
		role: "Full stack developer — mapping engine and APIs",
		challenge: "Provide routing and location services without depending on Google Maps pricing or limits.",
		description: "Mappy (mapy.world) is a custom mapping engine with navigation, search and route optimisation, exposed to enterprise customers through mapping APIs.\n\nI worked on the ASP.NET services, PostgreSQL spatial data and the React map front end.",
		outcomes: ["Self-hosted routing and geocoding", "Enterprise mapping APIs used by internal products", "Route optimisation for fleet use cases"],
	},
	"saudi-suite": {
		role: "Senior developer & team leader",
		challenge: "Ship four different products for the Saudi market in roughly three months with an international team.",
		description: "A suite of apps delivered for Code700 in Riyadh: Ensany (healthcare), Qaff (culture), Mozn (weather) and Cashback (rewards).\n\nI led the team, set the shared Node.js/React/Python architecture and integrated ERPNext for back-office operations.",
		outcomes: ["Four products delivered in about three months", "Shared component and service foundations across apps", "ERPNext integration for operations"],
	},
	"too-medical": {
		role: "Full stack developer",
		challenge: "Give pharma managers visibility over field representatives' visits and performance.",
		description: "Too Medical manages medical representatives: live location tracking, visit scheduling, a client CRM and performance analytics for managers.",
		outcomes: ["Live rep tracking and visit verification", "Scheduling and CRM in one tool", "Manager performance dashboards"],
	},
	"paymob-suite": {
		role: "Full stack developer",
		challenge: "Process and reconcile high volumes of payments with reliable financial reporting.",
		description: "ASM and FSM financial systems built around Paymob: payment processing, transaction management, reporting and ERP integration.",
		outcomes: ["Automated transaction reconciliation", "Financial reporting for operations and finance teams", "ERP integration"],
	},
	"too-bus": {
		role: "Full stack developer",
		challenge: "Keep parents informed and students safe on school routes.",
		description: "TOO Bus tracks school buses in real time, notifies parents of pickups and drop-offs and optimises routes for the school.",
		outcomes: ["Live bus tracking for parents and schools", "Automatic pickup and drop-off notifications", "Optimised daily routes"],
	},
	"too-security": {
		role: "Full stack developer",
		challenge: "Run a security workforce spread across many client sites.",
		description: "Too Security covers guard tracking, shift scheduling, HR, ERP and CRM for a security services company.",
		outcomes: ["Workforce tracking across sites", "Shift scheduling and HR in one system", "ERP and CRM for client contracts"],
	},
};

const projects = [
	{ slug: "too-app", title: "TOO APP", subtitle: "Ride-hailing platform", category: "Transportation", year: "2021–2023", summary: "Full-stack ride-hailing platform with real-time GPS tracking, payment gateways, driver management and ERP/CRM.", features: ["Real-time GPS tracking & dispatch", "Fawry and PayPal payments", "Driver & passenger apps", "Admin analytics dashboard"], tech: ["Laravel", "GoLang", "MySQL", "Socket.io"], url: "", imageUrl: "", featured: true },
	{ slug: "team1", title: "Team1", subtitle: "Emergency transportation", category: "Healthcare", year: "2024–2025", summary: "Healthcare transport coordination with real-time emergency dispatch, medical team chat and patient tracking.", features: ["Emergency dispatch", "Real-time team chat", "Patient tracking", "Hospital coordination"], tech: ["Laravel", "Node.js", "MySQL", "WebSocket"], url: "", imageUrl: "", featured: true },
	{ slug: "mappy", title: "Mappy", subtitle: "Google Maps alternative", category: "Navigation", year: "2022", summary: "Custom mapping engine with navigation, location services, route optimisation and enterprise mapping APIs.", features: ["Custom mapping engine", "Route optimisation", "Location services", "Enterprise APIs"], tech: ["ASP.NET", "React", "PostgreSQL"], url: "https://mapy.world", imageUrl: "", featured: true },
	{ slug: "saudi-suite", title: "Saudi Portfolio", subtitle: "Multi-app suite", category: "International", year: "2024", summary: "Ensany (healthcare), Qaff (culture), Mozn (weather) and Cashback (rewards) for the Saudi market.", features: ["Ensany healthcare", "Qaff cultural platform", "Mozn weather", "Cashback rewards"], tech: ["Node.js", "React", "Python", "ERPNext"], url: "", imageUrl: "", featured: true },
	{ slug: "too-medical", title: "Too Medical", subtitle: "Medical rep tracking", category: "Healthcare", year: "2022", summary: "Medical representative management with live tracking, visit scheduling, CRM and performance analytics.", features: ["Rep tracking", "Visit scheduling", "Client CRM", "Analytics"], tech: ["Laravel", "GoLang", "PostgreSQL"], url: "", imageUrl: "", featured: false },
	{ slug: "paymob-suite", title: "Paymob Suite", subtitle: "Fintech systems", category: "FinTech", year: "2021", summary: "ASM and FSM financial systems with payment processing, transaction management and reporting.", features: ["Payment integration", "Transactions", "Financial reporting", "ERP integration"], tech: ["Laravel", "PostgreSQL"], url: "", imageUrl: "", featured: false },
	{ slug: "too-bus", title: "TOO Bus", subtitle: "School transport", category: "Education", year: "2022", summary: "School bus tracking with real-time GPS, parent notifications and route optimisation.", features: ["Live bus tracking", "Parent notifications", "Route optimisation", "Student safety"], tech: ["Laravel", "GoLang", "MySQL"], url: "", imageUrl: "", featured: false },
	{ slug: "too-security", title: "Too Security", subtitle: "Workforce management", category: "Security", year: "2022", summary: "Security company operations: workforce tracking, shift scheduling, HR, ERP and CRM.", features: ["Workforce tracking", "Shift scheduling", "HR", "ERP & CRM"], tech: ["Laravel", "GoLang"], url: "", imageUrl: "", featured: false },
].map((p, i) => ({ ...p, ...projectDetails[p.slug], published: true, sort: i }));


const skillRows: [string, string, number, number][] = [
	["PHP & Laravel", "Backend", 5, 6], ["Node.js & Express", "Backend", 4, 4], ["GoLang", "Backend", 4, 3], ["ASP.NET Core / C#", "Backend", 4, 2], ["Python", "Backend", 3, 2],
	["JavaScript / TypeScript", "Frontend", 5, 6], ["React", "Frontend", 4, 4], ["Vue.js / Nuxt", "Frontend", 4, 4], ["HTML5 & CSS3", "Frontend", 5, 7],
	["MySQL", "Data & Cloud", 5, 6], ["PostgreSQL", "Data & Cloud", 4, 4], ["AWS", "Data & Cloud", 4, 3], ["Docker & CI/CD", "Data & Cloud", 3, 2],
	["Payment gateways", "Specialties", 5, 5], ["Real-time systems (WebSocket)", "Specialties", 5, 5], ["ERP / CRM", "Specialties", 4, 4], ["Mobile APIs (REST, GraphQL)", "Specialties", 5, 6],
	["Team leadership", "Leadership", 5, 3], ["System architecture", "Leadership", 4, 3], ["Agile / Scrum", "Leadership", 4, 4],
];

async function main() {
	await db.transaction(async (tx) => {
		await tx.insert(schema.profile).values(profile).onConflictDoUpdate({ target: schema.profile.id, set: profile });
		await tx.delete(schema.experiences);
		await tx.insert(schema.experiences).values(experiences);
		await tx.delete(schema.projects);
		await tx.insert(schema.projects).values(projects);
		await tx.delete(schema.skills);
		await tx.insert(schema.skills).values(skillRows.map(([name, category, level, years], i) => ({ name, category, level, years, sort: i })));

		const existing = await tx.query.cvs.findFirst();
		if (!existing) {
			const groups = new Map<string, string[]>();
			for (const [name, cat] of skillRows) groups.set(cat, [...(groups.get(cat) ?? []), name]);
			const data = cvDataSchema.parse({
				name: profile.name, title: profile.headline, email: profile.email, phone: profile.phone, location: profile.location,
				website: profile.website, linkedin: profile.linkedin, github: profile.github, photoUrl: profile.photoUrl, summary: profile.summary,
				experience: experiences.map((e) => ({ role: e.role, company: e.company, location: e.location, start: e.start, end: e.end, current: e.current, bullets: e.highlights })),
				projects: projects.filter((p) => p.featured).map((p) => ({ name: p.title, description: p.summary, tech: p.tech, url: p.url })),
				skills: [...groups.entries()].map(([name, items]) => ({ name, items })),
				languages: [{ name: "Arabic", level: "Native" }, { name: "English", level: "Professional" }],
			});
			await tx.insert(schema.cvs).values({ title: "Main CV", slug: "mohamed-habib", template: "modern", accent: "#3d5806", isPublic: true, data });
		}
	});
	console.log("Seeded profile, experiences, projects, skills (and a public 'mohamed-habib' CV if none existed).");
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => pool.end());
