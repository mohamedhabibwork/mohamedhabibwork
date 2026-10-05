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
	headline: "Senior Full-Stack Engineer · .NET Core & C# · PHP/Laravel",
	tagline: "Microservices, cloud-native and scalable systems — from product requirements to production.",
	summary:
		"Senior full-stack engineer and team leader with 7+ years building scalable web platforms from product requirements to production, across transportation, healthcare, fintech, e-commerce and education in Egypt, Saudi Arabia and the UAE. Backend in .NET Core/C#, PHP/Laravel and Node.js; frontend in React, Vue.js and TypeScript; data on PostgreSQL, MySQL, MongoDB, Redis and Elasticsearch; delivery on AWS, Azure, Docker and Kubernetes with CI/CD. I bring practical system design, a performance mindset and strong execution, paired with mentoring and clear communication.",
	email: "mohamedhabibwork@gmail.com",
	phone: "+20 115 197 8927",
	location: "Cairo, Egypt · Remote worldwide",
	website: "https://mohamedhabib.work",
	github: "https://github.com/mohamedhabibwork",
	linkedin: "https://www.linkedin.com/in/mohamedhabibwork/",
	availability: "Open to cloud-native, high-impact products · replies within 24 hours",
	photoUrl: "/brand/marks/mh-mark.svg",
	stats: [
		{ label: "Years experience", value: "7+" },
		{ label: "Projects delivered", value: "50+" },
		{ label: "Industries served", value: "6+" },
		{ label: "Delivery success", value: "95%" },
	],
	education: [
		{ degree: "Master's degree", school: "Faculty of Graduate Studies for Statistical Research (FGSSR), Cairo University", start: "", end: "2021" },
		{ degree: "MIS, Web Development", school: "High Institute for Computers and Management Information Systems (HICMIS)", start: "2016", end: "2020" },
	],
	certifications: [
		"PHP Essential Training",
		"PHP with MySQL Essential Training: 1 The Basics",
		"JavaScript and AJAX: Integration Techniques",
		"Learning Node.js",
		"Learning NPM the Node Package Manager",
	],
};

const experiences = [
	{ company: "BlackStone eIT", role: "Senior Full Stack Developer", location: "UAE (remote)", start: "Sep 2025", end: "", current: true, summary: "Feature delivery across backend and frontend with a focus on reliability and performance.", highlights: ["Design and implement .NET Core microservices with RabbitMQ/Kafka messaging and async workflows.", "Build CI/CD pipelines and raise release quality through automation and observability.", "Work across PostgreSQL/SQL Server, Redis, Elasticsearch, Kubernetes, Docker and the ABP/ASP.NET stack."], tech: [".NET Core", "C#", "ABP", "RabbitMQ", "Kafka", "PostgreSQL", "SQL Server", "Redis", "Elasticsearch", "Kubernetes", "Docker"] },
	{ company: "Mugsult", role: "Senior Full Stack Developer & Team Leader", location: "Egypt", start: "Sep 2024", end: "Aug 2025", current: false, summary: "Team1 emergency transportation platform.", highlights: ["Led development of Team1, an emergency healthcare transportation platform with real-time dispatch.", "Built real-time medical team chat and patient tracking over WebSockets.", "Coordinated hospital integrations and a team of 5+ developers."], tech: ["Laravel", "Node.js", "MySQL", "WebSocket"] },
	{ company: "Code700", role: "Full Stack Engineer", location: "Riyadh, Saudi Arabia", start: "Feb 2024", end: "Aug 2024", current: false, summary: "Full-stack modules, dashboards and admin tooling for the Saudi market.", highlights: ["Delivered full-stack modules in Laravel and Vue.js with integrated dashboards and admin tooling.", "Built REST/GraphQL APIs and microservices backed by MongoDB and Redis caches.", "Integrated third-party and payment services and improved API performance and reliability.", "Shipped Ensany, Qaff, Mozn and Cashback with product, design and QA using Scrum and CI/CD."], tech: ["Laravel", "Vue.js", "GraphQL", "MongoDB", "Redis", "Node.js", "Python"] },
	{ company: "Enjoy Driving", role: "Back End Developer · Team Lead", location: "Cairo, Egypt", start: "May 2023", end: "Feb 2024", current: false, summary: "Driver management and transportation applications.", highlights: ["Led a team of 5+ developers building driver management and transportation applications.", "Developed driver applications and agent management systems.", "Implemented store management with real-time inventory tracking.", "Achieved a 95%+ project delivery success rate with consistent client satisfaction."], tech: ["Laravel", "GoLang", "Socket programming", "MySQL", "React"] },
	{ company: "Al-Tawasol (Gulf Communication Company)", role: "PHP Developer", location: "New Cairo, Egypt", start: "Mar 2021", end: "Oct 2023", current: false, summary: "Transportation, mapping, medical and security platforms.", highlights: ["Built TOO APP, an Uber-like ride-hailing platform with real-time GPS dispatch and Fawry/PayPal payments.", "Developed Mappy, a custom mapping engine with route optimisation and enterprise mapping APIs.", "Delivered TOO Bus school transport tracking, Too Medical rep tracking and Too Security workforce management."], tech: ["Laravel", "GoLang", "ASP.NET", "PostgreSQL", "Socket.io"] },
	{ company: "Rwabett", role: "Back End Developer", location: "Egypt", start: "Aug 2020", end: "Jun 2021", current: false, summary: "E-commerce, ERP and CRM.", highlights: ["Built multi-vendor online stores with integrated ERP, CRM and inventory management.", "Developed mobile APIs for store and delivery apps."], tech: ["Laravel", "Vue.js", "MySQL"] },
	{ company: "Global Dev Gate", role: "Web Developer (training program)", location: "Egypt", start: "Sep 2018", end: "Jun 2020", current: false, summary: "NEN certification training and advanced web development program.", highlights: ["Developed distance-learning platforms and educational management systems.", "Integrated Fawry, Paymob and PayPal payment gateways for secure transactions.", "Built mobile API integrations for educational applications."], tech: ["PHP", "Laravel", "Vue.js", "React", "Node.js", "Python"] },
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


const services = [
	{ slug: "full-stack-development", title: "Full stack web development", icon: "code", summary: "End-to-end web platforms: APIs, dashboards and customer-facing apps built to scale.", description: "I design and build complete web products, from database schema and APIs to the admin dashboard and the customer-facing front end.\n\nTypical stacks are Laravel or Node.js on the backend with React or Vue on the front end, deployed with CI/CD and monitoring from day one.", deliverables: ["Architecture and data model", "REST or GraphQL API", "Admin dashboard", "Responsive web app", "CI/CD and deployment"], tech: ["Laravel", "Node.js", "React", "Vue.js", "PostgreSQL", "MySQL"], startingAt: "" },
	{ slug: "realtime-tracking", title: "Real-time tracking & dispatch", icon: "map-pin", summary: "Live GPS tracking, dispatch and notifications for fleets, rides, deliveries and field teams.", description: "I've built ride-hailing, school transport, ambulance dispatch and field-rep tracking platforms. I can deliver the location pipeline, dispatch logic and live dashboards your operations team needs.", deliverables: ["Live location ingestion", "Dispatch and assignment logic", "Driver and customer apps API", "Live operations dashboard", "Push and SMS notifications"], tech: ["GoLang", "Node.js", "Socket.io", "WebSocket", "Redis"], startingAt: "" },
	{ slug: "payment-integration", title: "Payment gateway integration", icon: "zap", summary: "Secure payments with Fawry, Paymob, PayPal and Stripe, including reconciliation and payouts.", description: "I integrate local and international payment gateways, handle webhooks and refunds safely, and reconcile transactions into your ERP or accounting system.", deliverables: ["Gateway integration", "Webhooks and idempotent processing", "Refunds and payouts", "Reconciliation reports"], tech: ["Fawry", "Paymob", "PayPal", "Stripe", "Laravel"], startingAt: "" },
	{ slug: "erp-crm", title: "ERP & CRM systems", icon: "layers", summary: "Custom ERP/CRM modules or ERPNext integrations for sales, inventory, HR and operations.", description: "From multi-vendor inventory to workforce scheduling, I build or integrate the back-office systems that keep operations running, including ERPNext customisation.", deliverables: ["Requirements and process mapping", "Custom modules", "ERPNext integration", "Reporting and dashboards", "Data migration"], tech: ["Laravel", "ERPNext", "Python", "PostgreSQL"], startingAt: "" },
	{ slug: "mobile-api", title: "Mobile app backends & APIs", icon: "monitor", summary: "Fast, versioned APIs for iOS and Android apps with auth, notifications and file storage.", description: "I build the backend your mobile team needs: authentication, versioned REST or GraphQL APIs, push notifications and media storage, documented and tested.", deliverables: ["API design and docs", "Auth and roles", "Push notifications", "File and media storage", "Monitoring"], tech: ["Laravel", "Node.js", "GraphQL", "AWS"], startingAt: "" },
	{ slug: "technical-leadership", title: "Technical leadership & consulting", icon: "users", summary: "Team leadership, architecture reviews and delivery process for teams of 5–10 developers.", description: "I've led distributed teams across Egypt, Saudi Arabia and the UAE. I can lead your team, review architecture, set up code review and release practices, or help hire and onboard developers.", deliverables: ["Architecture review", "Code review and standards", "Release and QA process", "Mentoring and hiring support"], tech: ["Agile / Scrum", "System design", "CI/CD"], startingAt: "" },
].map((s, i) => ({ ...s, published: true, sort: i }));

const skillRows: [string, string, number, number][] = [
	["PHP & Laravel", "Backend", 5, 7], [".NET Core / C# / ASP.NET", "Backend", 4, 3], ["Node.js & Express", "Backend", 4, 5], ["GoLang", "Backend", 4, 3], ["Python", "Backend", 3, 2],
	["JavaScript / TypeScript", "Frontend", 5, 7], ["Vue.js / Nuxt", "Frontend", 5, 5], ["React", "Frontend", 4, 5], ["HTML5 & CSS3", "Frontend", 5, 7],
	["PostgreSQL", "Data", 4, 5], ["MySQL", "Data", 5, 7], ["MongoDB", "Data", 4, 3], ["Redis", "Data", 4, 4], ["Elasticsearch", "Data", 3, 2],
	["Docker", "Cloud & DevOps", 4, 4], ["Kubernetes", "Cloud & DevOps", 3, 2], ["AWS", "Cloud & DevOps", 4, 3], ["Azure", "Cloud & DevOps", 3, 2], ["CI/CD", "Cloud & DevOps", 4, 4],
	["Microservices", "Architecture", 4, 3], ["REST & GraphQL APIs", "Architecture", 5, 6], ["Event-driven (RabbitMQ / Kafka)", "Architecture", 4, 2], ["Real-time systems (WebSocket)", "Architecture", 5, 5],
	["Payment gateways", "Specialties", 5, 6], ["ERP / CRM", "Specialties", 4, 4],
	["Team leadership", "Leadership", 5, 3], ["System design", "Leadership", 4, 4], ["Agile / Scrum", "Leadership", 4, 5],
];

async function main() {
	await db.transaction(async (tx) => {
		await tx.insert(schema.profile).values(profile).onConflictDoUpdate({ target: schema.profile.id, set: profile });
		await tx.delete(schema.experiences);
		await tx.insert(schema.experiences).values(experiences);
		await tx.delete(schema.projects);
		await tx.insert(schema.projects).values(projects);
		await tx.delete(schema.services);
		await tx.insert(schema.services).values(services);
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
				education: profile.education,
				certifications: profile.certifications,
				languages: [{ name: "Arabic", level: "Native" }, { name: "English", level: "Professional" }],
			});
			await tx.insert(schema.cvs).values({ title: "Main CV", slug: "mohamed-habib", template: "modern", accent: "#3d5806", isPublic: true, data });
		}
	});
	console.log("Seeded profile, experiences, projects, services, skills (and a public 'mohamed-habib' CV if none existed).");
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => pool.end());
