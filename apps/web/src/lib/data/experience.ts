export interface ExperienceEntry {
	company: string;
	current?: boolean;
	description: string;
	period: string;
	role: string;
	tech: readonly string[];
}

export const experience: readonly ExperienceEntry[] = [
	{
		period: "Sep 2025 - Present",
		company: "backstoreEIT",
		role: "Senior Full Stack Developer (ASP.NET Core) & Team Leader",
		description:
			"Leading full stack development with ASP.NET Core on projects including EDE and SDDUMP in UAE. Team leadership, technical architecture, and delivery of scalable enterprise applications.",
		tech: ["ASP.NET Core", "C#", "Team Leadership", "EDE", "SDDUMP"],
		current: true,
	},
	{
		period: "2024 - 2025",
		company: "Mugsult",
		role: "Senior Full Stack Developer & Team Leader",
		description:
			"Led development of Team1 emergency transportation platform with real-time dispatch and healthcare coordination.",
		tech: ["Laravel", "Node.js", "Team Leadership"],
	},
	{
		period: "2024",
		company: "Code700 (Riyadh, Saudi Arabia)",
		role: "Senior Developer & Team Leader",
		description:
			"Multi-application development for Saudi market: Ensany, Qaff, Mozn, Cashback applications with international team coordination.",
		tech: ["Node.js", "React", "Python", "ERPNext"],
	},
	{
		period: "2023 - 2024",
		company: "Enjoy Driving",
		role: "Senior Full Stack Developer & Team Leader",
		description:
			"Led development team for driver applications, agent management systems, and store operations with focus on user experience.",
		tech: ["Laravel", "Vue.js", "Team Management"],
	},
	{
		period: "2021 - 2023",
		company: "Gulf Communication Company",
		role: "Full Stack Developer",
		description:
			"Developed transportation apps (TOO APP, TOO Bus), mapping solutions (Mappy), medical tracking (Too Medical), and security management systems.",
		tech: ["Laravel", "GoLang", "ASP.NET", "PostgreSQL"],
	},
	{
		period: "2020 - 2021",
		company: "Rawabet Company",
		role: "Full Stack Developer",
		description:
			"Focused on online stores, ERP systems, CRM solutions, and mobile API development. Built comprehensive e-commerce platforms with integrated business management systems.",
		tech: ["PHP", "Laravel", "Vue.js", "MySQL", "ERP"],
	},
	{
		period: "2018 - 2020",
		company: "Various Companies",
		role: "Full Stack Developer",
		description:
			"Started with distance learning platforms, e-commerce solutions, and payment gateway integrations. Specialized in payment integrations (Fawry, Paymob, PayPal).",
		tech: ["PHP", "Vue.js", "Payment Gateways", "MySQL"],
	},
	{
		period: "2017",
		company: "Self-taught",
		role: "Foundation Phase",
		description:
			"Started with C++ programming fundamentals, then transitioned to web development with HTML5, CSS3, and website design.",
		tech: ["C++", "HTML5", "CSS3", "JavaScript"],
	},
] as const;
