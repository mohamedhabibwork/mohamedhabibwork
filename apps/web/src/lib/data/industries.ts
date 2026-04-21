export interface Industry {
	description: string;
	id: string;
	name: string;
}

export interface Industries {
	items: readonly Industry[];
}

export const industries: Industries = {
	items: [
		{
			id: "transportation",
			name: "Transportation",
			description:
				"Logistics, fleet management, and real-time tracking solutions for transportation businesses.",
		},
		{
			id: "healthcare",
			name: "Healthcare",
			description:
				"Medical platforms, emergency services, and healthcare management systems.",
		},
		{
			id: "fintech",
			name: "FinTech",
			description:
				"Payment processing, financial platforms, and transaction management solutions.",
		},
		{
			id: "ecommerce",
			name: "E-commerce",
			description:
				"Online retail platforms, inventory systems, and digital marketplace solutions.",
		},
		{
			id: "security",
			name: "Security",
			description:
				"Security services management, monitoring systems, and incident response platforms.",
		},
		{
			id: "education",
			name: "Education",
			description:
				"Learning management systems, educational platforms, and online course solutions.",
		},
	] as const,
} as const;
