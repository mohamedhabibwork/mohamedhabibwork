export interface SkillItem {
	desc: string;
	level: string;
	name: string;
	years: number;
}

export interface LeadershipItem {
	desc: string;
	name: string;
	years?: number;
}

export interface Skills {
	backend: readonly SkillItem[];
	cloud: readonly SkillItem[];
	database: readonly SkillItem[];
	frontend: readonly SkillItem[];
	leadership: readonly LeadershipItem[];
	specializations: readonly string[];
}

export const skills: Skills = {
	backend: [
		{
			name: "PHP & Laravel",
			level: "Expert",
			years: 6,
			desc: "Enterprise Solutions • Real-time Systems",
		},
		{
			name: "Node.js & Express",
			level: "Advanced",
			years: 4,
			desc: "WebSocket • Chat Systems • APIs",
		},
		{
			name: "Go/Golang",
			level: "Advanced",
			years: 3,
			desc: "Socket Programming • High Performance",
		},
		{
			name: "Python",
			level: "Intermediate",
			years: 2,
			desc: "Data Processing • Automation",
		},
	] as const,
	frontend: [
		{
			name: "React.js",
			level: "Advanced",
			years: 4,
			desc: "Hooks • Redux • Modern Patterns",
		},
		{
			name: "Vue.js",
			level: "Advanced",
			years: 4,
			desc: "Composition API • Vuex • Nuxt.js",
		},
		{
			name: "JavaScript ES6+",
			level: "Expert",
			years: 6,
			desc: "TypeScript • Async/Await • Modules",
		},
		{
			name: "HTML5 & CSS3",
			level: "Expert",
			years: 7,
			desc: "Flexbox • Grid • Animations",
		},
	] as const,
	database: [
		{
			name: "MySQL",
			level: "Expert",
			years: 6,
			desc: "Optimization • Indexing • Replication",
		},
		{
			name: "PostgreSQL",
			level: "Advanced",
			years: 4,
			desc: "Complex Queries • JSON Support",
		},
	] as const,
	cloud: [
		{
			name: "AWS Cloud",
			level: "Advanced",
			years: 3,
			desc: "EC2 • RDS • S3 • Lambda",
		},
		{
			name: "Docker & DevOps",
			level: "Intermediate",
			years: 2,
			desc: "Containerization • CI/CD",
		},
	] as const,
	leadership: [
		{
			name: "Team Leadership",
			years: 3,
			desc: "5-10 Developers",
		},
		{
			name: "System Architecture",
			desc: "Microservices • Scalable",
		},
		{
			name: "Project Management",
			desc: "Agile • Scrum",
		},
	] as const,
	specializations: [
		"Real-time Tracking Systems",
		"Payment Gateway Integrations",
		"ERP/CRM Solutions",
		"Mobile API Development",
	] as const,
} as const;
