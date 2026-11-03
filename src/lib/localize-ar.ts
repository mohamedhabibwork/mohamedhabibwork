import {
	AR_EXPERIENCES,
	AR_PROFILE,
	AR_PROJECTS,
	AR_SERVICES,
	arabicMonth,
} from "#/content/ar";
import type { getPortfolio } from "#/server/fn/public";

type PortfolioData = Awaited<ReturnType<typeof getPortfolio>>;
type Profile = NonNullable<PortfolioData["profile"]>;
type Experience = PortfolioData["experiences"][number];

/** Copies Arabic fields onto a row, skipping fields a partial query didn't select. */
const overlay = <T extends object>(row: T, ar: object | undefined): T =>
	ar
		? {
				...row,
				...Object.fromEntries(Object.entries(ar).filter(([key]) => key in row)),
			}
		: row;

export const project = <T extends { slug: string }>(row: T): T =>
	overlay(row, AR_PROJECTS[row.slug]);

export const service = <T extends { slug: string }>(row: T): T =>
	overlay(row, AR_SERVICES[row.slug]);

const experience = (row: Experience): Experience => ({
	...overlay(row, AR_EXPERIENCES[`${row.company}|${row.start}`]),
	start: arabicMonth(row.start),
	end: arabicMonth(row.end),
});

export const owner = <T extends { availability: string }>(row: T): T => ({
	...row,
	availability: AR_PROFILE.availability,
});

const profile = (row: Profile): Profile => ({
	...row,
	headline: AR_PROFILE.headline,
	tagline: AR_PROFILE.tagline,
	summary: AR_PROFILE.summary,
	location: AR_PROFILE.location,
	availability: AR_PROFILE.availability,
	stats: row.stats.map((s) => ({
		...s,
		label: AR_PROFILE.stats[s.label] ?? s.label,
	})),
	education: row.education.map((e) => ({
		...e,
		...AR_PROFILE.education[e.degree],
	})),
});

export const portfolio = (data: PortfolioData): PortfolioData => ({
	...data,
	profile: data.profile && profile(data.profile),
	experiences: data.experiences.map(experience),
	projects: data.projects.map(project),
	services: data.services.map(service),
});
