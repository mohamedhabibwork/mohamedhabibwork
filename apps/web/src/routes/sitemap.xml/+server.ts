import type { RequestHandler } from "@sveltejs/kit";
import { serverClient } from "$lib/orpc.server";

const BASE_URL = "https://mohamedhabib.work";

interface SitemapUrl {
	changefreq: string;
	lastmod: string;
	loc: string;
	priority: number;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
	const urlEntries = urls
		.map(
			(url) => `	<url>
		<loc>${url.loc}</loc>
		<lastmod>${url.lastmod}</lastmod>
		<changefreq>${url.changefreq}</changefreq>
		<priority>${url.priority.toFixed(1)}</priority>
	</url>`
		)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export const GET: RequestHandler = async () => {
	const today = new Date().toISOString().split("T")[0];

	// Fetch dynamic data from backend
	const [_profileData, projectsData, experienceData] = await Promise.all([
		serverClient.profile().catch(() => null),
		serverClient.projects().catch(() => null),
		serverClient.experience().catch(() => null),
	]);

	const urls: SitemapUrl[] = [
		// Static pages
		{
			loc: `${BASE_URL}/`,
			lastmod: today,
			changefreq: "weekly",
			priority: 1.0,
		},
		{
			loc: `${BASE_URL}/about`,
			lastmod: today,
			changefreq: "monthly",
			priority: 0.8,
		},
		{
			loc: `${BASE_URL}/projects`,
			lastmod: today,
			changefreq: "weekly",
			priority: 0.9,
		},
		{
			loc: `${BASE_URL}/contact`,
			lastmod: today,
			changefreq: "monthly",
			priority: 0.7,
		},
		{
			loc: `${BASE_URL}/resume`,
			lastmod: today,
			changefreq: "monthly",
			priority: 0.6,
		},
	];

	// Add project detail pages if available
	if (projectsData?.projects) {
		for (const project of projectsData.projects) {
			urls.push({
				loc: `${BASE_URL}/projects/${project.id}`,
				lastmod: today,
				changefreq: "monthly",
				priority: 0.6,
			});
		}
	}

	// Add experience/ career timeline entries
	if (experienceData) {
		for (const exp of experienceData) {
			urls.push({
				loc: `${BASE_URL}/about#experience-${exp.id}`,
				lastmod: today,
				changefreq: "yearly",
				priority: 0.5,
			});
		}
	}

	const sitemapXml = generateSitemapXml(urls);

	return new Response(sitemapXml, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "max-age=3600",
		},
	});
};
