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

export const profile: Profile = {
	name: "Mohammad Habib",
	title: "Senior Full Stack Developer & Team Leader",
	tagline:
		"Transforming ideas into scalable digital solutions with 7+ years of expertise in enterprise development and team leadership.",
	email: "contact@mohamedhabib.work",
	whatsapp: "+201151978927",
	linkedin: "https://linkedin.com/in/mohamedhabibwork",
	github: "https://github.com/mohamedhabibwork",
	location: "Egypt • Remote Available Globally",
	timezone: "GMT+2",
	availability: "Available for hire - Remote & On-site",
	stats: {
		years: 7,
		projects: 50,
		industries: 6,
		successRate: 95,
	},
	bio: "A passionate Senior Full Stack Developer with a proven track record of transforming complex business requirements into scalable digital solutions.",
} as const;
