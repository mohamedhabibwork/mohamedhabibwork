export interface Project {
	category: string;
	company: string;
	description: string;
	features: readonly string[];
	id: string;
	techStack: readonly string[];
	title: string;
	url?: string;
	year: string;
}

export const projects: readonly Project[] = [
	{
		id: "too-app",
		title: "TOO APP",
		category: "Transportation",
		description:
			"Complete Uber-like ride-hailing platform with real-time GPS tracking, payment gateway integration, driver management, and enterprise-level ERP/CRM systems.",
		features: [
			"Real-time GPS tracking & dispatch",
			"Payment gateway integration (Fawry, PayPal)",
			"Driver & passenger mobile apps",
			"Admin dashboard with analytics",
		],
		techStack: ["Laravel", "GoLang", "MySQL", "Socket.io", "Payment APIs"],
		year: "2024-2025",
		company: "Mugsult",
	},
	{
		id: "team1",
		title: "Team1",
		category: "Healthcare",
		description:
			"Critical healthcare transportation coordination system with real-time emergency dispatch, medical team communication, and patient tracking capabilities.",
		features: [
			"Emergency dispatch system",
			"Real-time medical team chat",
			"Patient tracking & monitoring",
			"Hospital coordination interface",
		],
		techStack: ["Laravel", "Node.js", "MySQL", "WebSocket", "Real-time Chat"],
		year: "2024-2025",
		company: "Mugsult",
	},
	{
		id: "mappy",
		title: "Mappy",
		category: "Navigation",
		description:
			"Custom mapping solution with complete navigation system, location services, route optimization, and enterprise mapping APIs for businesses.",
		features: [
			"Custom mapping engine",
			"Route optimization algorithms",
			"Location-based services",
			"Enterprise mapping APIs",
		],
		techStack: ["ASP.NET", "React", "PostgreSQL"],
		year: "2021-2023",
		company: "Gulf Communication",
		url: "https://mapy.world",
	},
	{
		id: "too-medical",
		title: "Too Medical",
		category: "Healthcare",
		description:
			"Comprehensive medical representative management system with real-time tracking, visit scheduling, client management, and performance analytics.",
		features: [
			"Medical rep tracking & monitoring",
			"Visit scheduling & management",
			"Client relationship management",
			"Performance analytics dashboard",
		],
		techStack: ["Laravel", "GoLang", "PostgreSQL", "ERP Integration"],
		year: "2021-2023",
		company: "Gulf Communication",
	},
	{
		id: "paymob-suite",
		title: "Paymob Suite",
		category: "FinTech",
		description:
			"Enterprise financial management systems including ASM and FSM projects with payment processing, transaction management, and financial reporting.",
		features: [
			"Payment gateway integration",
			"Transaction management system",
			"Financial reporting & analytics",
			"Enterprise ERP integration",
		],
		techStack: ["Laravel", "PostgreSQL", "Payment APIs", "Financial Systems"],
		year: "2018-2020",
		company: "Various",
	},
	{
		id: "saudi-portfolio",
		title: "Saudi Portfolio",
		category: "International",
		description:
			"Complete digital solutions suite for Saudi Arabian market including Ensany, Qaff, Mozn, and Cashback applications with international team leadership.",
		features: [
			"Ensany: Healthcare management",
			"Qaff: Cultural platform",
			"Mozn: Weather services",
			"Cashback: Rewards system",
		],
		techStack: ["Node.js", "React", "Python", "ERPNext"],
		year: "2024",
		company: "Code700 (Riyadh, Saudi Arabia)",
	},
	{
		id: "too-bus",
		title: "TOO Bus",
		category: "Education",
		description:
			"Comprehensive school bus tracking system ensuring student safety with real-time GPS monitoring, parent notifications, and route optimization.",
		features: [
			"Real-time school bus tracking",
			"Parent notification system",
			"Route optimization algorithms",
			"Student safety monitoring",
		],
		techStack: ["Laravel", "GoLang", "MySQL", "GPS Tracking"],
		year: "2021-2023",
		company: "Gulf Communication",
	},
	{
		id: "too-security",
		title: "Too Security",
		category: "Security",
		description:
			"Enterprise security company management system with workforce tracking, shift scheduling, HR management, and comprehensive security operations oversight.",
		features: [
			"Security workforce tracking",
			"Shift scheduling & management",
			"HR management system",
			"ERP & CRM integration",
		],
		techStack: ["Laravel", "GoLang", "ERP System", "HR Management"],
		year: "2021-2023",
		company: "Gulf Communication",
	},
	{
		id: "ecommerce-solutions",
		title: "E-commerce Solutions",
		category: "E-commerce",
		description:
			"Comprehensive e-commerce platforms with integrated ERP systems, CRM solutions, mobile APIs, and complete online store management.",
		features: [
			"Multi-vendor online stores",
			"Integrated ERP systems",
			"Mobile API development",
			"CRM & inventory management",
		],
		techStack: ["Laravel", "Vue.js", "MySQL", "E-commerce APIs"],
		year: "2020-2021",
		company: "Rawabet",
	},
	{
		id: "learning-platforms",
		title: "Learning Platforms",
		category: "Education",
		description:
			"Advanced distance learning platforms with mobile API integrations, NEN certification systems, and comprehensive educational management solutions.",
		features: [
			"Distance learning platforms",
			"Mobile API integrations",
			"NEN certification system",
			"Educational management tools",
		],
		techStack: ["Laravel", "Vue.js", "Python", "Educational APIs"],
		year: "2018-2020",
		company: "Various",
	},
] as const;

export const categories = [
	"All",
	"Transportation",
	"Healthcare",
	"Navigation",
	"FinTech",
	"International",
	"Education",
	"Security",
	"E-commerce",
] as const;

export type Category = (typeof categories)[number];
