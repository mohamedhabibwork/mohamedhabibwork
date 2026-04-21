export interface Profile {
	availability: string;
	bio: string;
	email: string;
	github: string;
	linkedin: string;
	location: string;
	name: string;
	stats: {
		years: number;
		projects: number;
		industries: number;
		successRate: number;
	};
	tagline: string;
	timezone: string;
	title: string;
	whatsapp: string;
}

export interface Skill {
	category: string;
	description: string;
	id: number;
	level: string;
	name: string;
	years: number | null;
}

export interface Skills {
	backend: Skill[];
	cloud: Skill[];
	database: Skill[];
	frontend: Skill[];
	leadership: Skill[];
	specializations: string[];
}

export interface Project {
	category: string;
	company: string;
	description: string;
	features: string[];
	id: string;
	techStack: string[];
	title: string;
	url?: string | null;
	year: string;
}

export type Category = string;

export interface ExperienceEntry {
	company: string;
	current: boolean;
	description: string;
	id: number;
	period: string;
	role: string;
	tech: string[];
}

export interface Industry {
	description: string;
	id: string;
	name: string;
}

export const profile = {
	availability: "Available for hire",
	bio: "",
	email: "",
	github: "",
	linkedin: "",
	location: "",
	name: "Mohamed Habib",
	stats: {
		years: 7,
		projects: 50,
		industries: 6,
		successRate: 95,
	},
	tagline: "",
	timezone: "",
	title: "",
	whatsapp: "",
} satisfies Profile;
