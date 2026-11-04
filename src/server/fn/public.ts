import { createServerFn } from "@tanstack/react-start";
import { clientIp } from "#/server/client-ip";
import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "#/db";
import {
	blogPosts,
	cvs,
	experiences,
	messages,
	projects,
	services,
	skills,
} from "#/db/schema";
import {
	minutesForWords,
	postLocale,
	RELATED_POST_COUNT,
	readingMinutes,
} from "#/lib/blog";
import {
	type ContentLocale,
	contentLocaleSchema,
	EXPERIENCE_TEXT,
	hasArabic,
	localizeRow,
	PROFILE_TEXT,
	PROJECT_TEXT,
	portfolioHasArabic,
	SERVICE_CARD_TEXT,
	SERVICE_TEXT,
} from "#/lib/localized";
import { notifyOwnerOfMessage } from "#/server/mail";
import { paypalPublicConfig } from "#/server/paypal";
import { notifyOwnerPush } from "#/server/push";
import { verifyTurnstile } from "#/server/turnstile";

/** Optional input of list loaders: `{ locale }`, defaulting to English. */
type LocaleInput = { locale?: ContentLocale } | undefined;
const localeInput = z.object({ locale: contentLocaleSchema }).default({
	locale: "en",
});

/** Input of detail loaders: a bare slug (English) or `{ slug, locale }`. */
type SlugInput = string | { slug: string; locale?: ContentLocale };
const slugInput = z.preprocess(
	(input) => (typeof input === "string" ? { slug: input } : input),
	z.object({
		slug: z.string().trim().min(1).max(120),
		locale: contentLocaleSchema,
	}),
);

/** Everything the public portfolio page renders, in one round trip. */
export const getPortfolio = createServerFn({ method: "GET" })
	.validator((input: LocaleInput) => localeInput.parse(input))
	.handler(async ({ data: { locale } }) =>
		withDb(async (db) => {
			const [p, exp, proj, sk, publicCvs, svc] = await Promise.all([
				db.query.profile.findFirst(),
				db
					.select()
					.from(experiences)
					.orderBy(asc(experiences.sort), desc(experiences.start)),
				db
					.select()
					.from(projects)
					.where(eq(projects.published, true))
					.orderBy(desc(projects.featured), asc(projects.sort)),
				db.select().from(skills).orderBy(asc(skills.sort), desc(skills.level)),
				db
					.select({ slug: cvs.slug, title: cvs.title })
					.from(cvs)
					.where(eq(cvs.isPublic, true))
					.orderBy(desc(cvs.updatedAt)),
				db
					.select({
						slug: services.slug,
						title: services.title,
						icon: services.icon,
						summary: services.summary,
						startingAt: services.startingAt,
						titleAr: services.titleAr,
						summaryAr: services.summaryAr,
					})
					.from(services)
					.where(eq(services.published, true))
					.orderBy(asc(services.sort)),
			]);
			return {
				profile: p ? localizeRow(p, PROFILE_TEXT, locale) : null,
				experiences: exp.map((e) => localizeRow(e, EXPERIENCE_TEXT, locale)),
				projects: proj.map((row) => localizeRow(row, PROJECT_TEXT, locale)),
				skills: sk,
				publicCvs,
				services: svc.map((row) =>
					localizeRow(row, SERVICE_CARD_TEXT, locale),
				),
				hasArabic: portfolioHasArabic({
					profile: p,
					projects: proj,
					services: svc,
					experiences: exp,
				}),
			};
		}),
	);

/** All published projects for /projects. */
export const getProjects = createServerFn({ method: "GET" })
	.validator((input: LocaleInput) => localeInput.parse(input))
	.handler(async ({ data: { locale } }) => {
		const rows = await withDb((db) =>
			db
				.select()
				.from(projects)
				.where(eq(projects.published, true))
				.orderBy(desc(projects.featured), asc(projects.sort)),
		);
		return rows.map((row) => ({
			...localizeRow(row, PROJECT_TEXT, locale),
			hasArabic: hasArabic(row, PROJECT_TEXT),
		}));
	});

/** All published services for /services. */
export const getServices = createServerFn({ method: "GET" })
	.validator((input: LocaleInput) => localeInput.parse(input))
	.handler(async ({ data: { locale } }) => {
		const rows = await withDb((db) =>
			db
				.select()
				.from(services)
				.where(eq(services.published, true))
				.orderBy(asc(services.sort)),
		);
		return rows.map((row) => ({
			...localizeRow(row, SERVICE_TEXT, locale),
			hasArabic: hasArabic(row, SERVICE_TEXT),
		}));
	});

/** One published service plus the others for cross-links. Returns null when missing. */
export const getService = createServerFn({ method: "GET" })
	.validator((input: SlugInput) => slugInput.parse(input))
	.handler(async ({ data: { slug, locale } }) =>
		withDb(async (db) => {
			const service = await db.query.services.findFirst({
				where: and(eq(services.slug, slug), eq(services.published, true)),
			});
			if (!service) return null;
			const others = await db
				.select({
					slug: services.slug,
					title: services.title,
					icon: services.icon,
					summary: services.summary,
					titleAr: services.titleAr,
					summaryAr: services.summaryAr,
				})
				.from(services)
				.where(and(eq(services.published, true), ne(services.id, service.id)))
				.orderBy(asc(services.sort));
			const owner = await db.query.profile.findFirst({
				columns: { name: true, email: true, phone: true },
			});
			return {
				service: localizeRow(service, SERVICE_TEXT, locale),
				hasArabic: hasArabic(service, SERVICE_TEXT),
				others: others.map((row) =>
					localizeRow(row, SERVICE_CARD_TEXT, locale),
				),
				owner: owner ?? null,
				paypal: paypalPublicConfig(),
			};
		}),
	);

const BLOG_INDEX_LIMIT = 100;

/** Published posts for /blog, newest first. Language and word count are worked out here so bodies stay on the server. */
export const getBlogPosts = createServerFn({ method: "GET" }).handler(
	async () =>
		withDb(async (db) => {
			const rows = await db
				.select({
					slug: blogPosts.slug,
					title: blogPosts.title,
					excerpt: blogPosts.excerpt,
					tags: blogPosts.tags,
					publishedAt: blogPosts.publishedAt,
					body: blogPosts.body,
					words: sql<number>`coalesce(array_length(regexp_split_to_array(trim(${blogPosts.body}), '\\s+'), 1), 0)`,
				})
				.from(blogPosts)
				.where(eq(blogPosts.published, true))
				.orderBy(desc(blogPosts.publishedAt))
				.limit(BLOG_INDEX_LIMIT);
			return rows.map(({ words, body, ...post }) => ({
				...post,
				locale: postLocale({ ...post, body }),
				minutes: minutesForWords(Number(words)),
			}));
		}),
);

/** One published blog post plus related posts (shared tags first, then newest). Returns null when missing. */
export const getBlogPost = createServerFn({ method: "GET" })
	.validator((slug: unknown) => z.string().trim().min(1).max(120).parse(slug))
	.handler(async ({ data: slug }) =>
		withDb(async (db) => {
			const post = await db.query.blogPosts.findFirst({
				where: and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)),
			});
			if (!post) return null;
			// The paired EN/AR post, linked either way round by `translationOf`.
			const translation =
				(await db.query.blogPosts.findFirst({
					columns: { id: true, slug: true, title: true },
					where: and(
						eq(blogPosts.published, true),
						post.translationOf
							? eq(blogPosts.id, post.translationOf)
							: eq(blogPosts.translationOf, post.id),
					),
				})) ?? null;
			// Rank on metadata only; bodies are loaded for the few posts we actually show.
			const candidates = await db
				.select({
					slug: blogPosts.slug,
					title: blogPosts.title,
					excerpt: blogPosts.excerpt,
					tags: blogPosts.tags,
				})
				.from(blogPosts)
				.where(
					and(
						eq(blogPosts.published, true),
						ne(blogPosts.id, post.id),
						translation ? ne(blogPosts.id, translation.id) : undefined,
					),
				)
				.orderBy(desc(blogPosts.publishedAt));
			const sharesTag = (p: { tags: string[] }) =>
				p.tags.some((tag) => post.tags.includes(tag));
			const picked = [
				...candidates.filter(sharesTag),
				...candidates.filter((p) => !sharesTag(p)),
			].slice(0, RELATED_POST_COUNT);
			const bodies = picked.length
				? await db
						.select({ slug: blogPosts.slug, body: blogPosts.body })
						.from(blogPosts)
						.where(
							inArray(
								blogPosts.slug,
								picked.map((p) => p.slug),
							),
						)
				: [];
			const bodyBySlug = new Map(bodies.map((b) => [b.slug, b.body]));
			const related = picked.map((p) => {
				const body = bodyBySlug.get(p.slug) ?? "";
				return {
					...p,
					locale: postLocale({ ...p, body }),
					minutes: readingMinutes(body),
				};
			});
			return {
				post,
				related,
				translation: translation
					? { slug: translation.slug, title: translation.title }
					: null,
			};
		}),
	);

/** One published project plus a few related ones for /projects/$slug. Returns null when missing. */
export const getProject = createServerFn({ method: "GET" })
	.validator((input: SlugInput) => slugInput.parse(input))
	.handler(async ({ data: { slug, locale } }) =>
		withDb(async (db) => {
			const project = await db.query.projects.findFirst({
				where: and(eq(projects.slug, slug), eq(projects.published, true)),
			});
			if (!project) return null;
			const related = await db
				.select({
					slug: projects.slug,
					title: projects.title,
					subtitle: projects.subtitle,
					category: projects.category,
					titleAr: projects.titleAr,
					subtitleAr: projects.subtitleAr,
				})
				.from(projects)
				.where(and(eq(projects.published, true), ne(projects.id, project.id)))
				.orderBy(desc(projects.featured), asc(projects.sort))
				.limit(3);
			return {
				project: localizeRow(project, PROJECT_TEXT, locale),
				hasArabic: hasArabic(project, PROJECT_TEXT),
				related: related.map((row) =>
					localizeRow(row, ["title", "subtitle"], locale),
				),
			};
		}),
	);

const contactSchema = z.object({
	name: z.string().trim().min(2, "Enter your name").max(120),
	email: z.string().trim().email("Enter a valid email").max(200),
	subject: z.string().trim().max(200).default(""),
	service: z
		.string()
		.trim()
		.max(120)
		.regex(/^[a-z0-9-]*$/)
		.default(""),
	body: z
		.string()
		.trim()
		.min(10, "Tell me a little more (10+ characters)")
		.max(5000),
	"cf-turnstile-response": z.string().max(2048).default(""),
	/** Honeypot: hidden from people, but browser autofill can fill it. Filled values are dropped, not reported as errors. */
	hp_check: z.string().max(200).default(""),
});

export const sendMessage = createServerFn({ method: "POST" })
	.validator((input: unknown) => contactSchema.parse(input))
	.handler(async ({ data }) => {
		// A bot filled the honeypot: pretend success and store nothing.
		if (data.hp_check) return { ok: true as const };
		if (
			!(await verifyTurnstile(
				data["cf-turnstile-response"],
				"contact",
				clientIp(),
			))
		) {
			return {
				ok: false as const,
				error: "Please complete the verification and try again.",
			};
		}
		const msg = {
			name: data.name,
			email: data.email,
			subject: data.subject,
			service: data.service,
			body: data.body,
		};
		// Only keep a service tag that matches a real published service.
		const serviceTitle = await withDb(async (db) => {
			const svc = msg.service
				? await db.query.services.findFirst({
						where: and(
							eq(services.slug, msg.service),
							eq(services.published, true),
						),
					})
				: undefined;
			await db
				.insert(messages)
				.values({ ...msg, service: svc ? msg.service : "" });
			return svc?.title ?? "";
		});
		await Promise.all([
			notifyOwnerOfMessage({ ...msg, serviceTitle }),
			notifyOwnerPush({
				title: `New message from ${msg.name}`,
				body: `${serviceTitle ? `[${serviceTitle}] ` : ""}${msg.subject || msg.body}`,
				url: "/admin/messages",
			}),
		]);
		return { ok: true as const };
	});
