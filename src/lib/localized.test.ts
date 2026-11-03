import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { hasArabic, mostlyArabic, portfolioHasArabic } from "#/lib/localized";

const translatedService = {
	title: "A",
	titleAr: "أ",
	summary: "B",
	summaryAr: "ب",
};
const englishService = {
	title: "A",
	titleAr: null,
	summary: "B",
	summaryAr: null,
};

describe("hasArabic", () => {
	test("is true when every English field has an Arabic twin", () => {
		assert.equal(hasArabic(translatedService, ["title", "summary"]), true);
	});

	test("is false when any English field has no Arabic twin", () => {
		const row = { title: "A", titleAr: "أ", summary: "B", summaryAr: "  " };
		assert.equal(hasArabic(row, ["title", "summary"]), false);
	});

	test("ignores fields with no English content", () => {
		const row = { title: "A", titleAr: "أ", challenge: "", challengeAr: null };
		assert.equal(hasArabic(row, ["title", "challenge"]), true);
	});

	test("treats array fields as translated when a line has content", () => {
		const row = {
			features: ["x"],
			featuresAr: ["س"],
			outcomes: ["y"],
			outcomesAr: [""],
		};
		assert.equal(hasArabic(row, ["features"]), true);
		assert.equal(hasArabic(row, ["outcomes"]), false);
	});
});

describe("mostlyArabic", () => {
	test("needs more than half", () => {
		assert.equal(mostlyArabic([true, true, false]), true);
		assert.equal(mostlyArabic([true, false]), false);
		assert.equal(mostlyArabic([]), false);
	});
});

describe("portfolioHasArabic", () => {
	const profile = {
		headline: "H",
		headlineAr: "ه",
		tagline: "T",
		taglineAr: "ت",
		summary: "S",
		summaryAr: "س",
		availability: "A",
		availabilityAr: "ا",
	};
	const experience = {
		role: "R",
		roleAr: "ر",
		summary: "S",
		summaryAr: "س",
		highlights: ["x"],
		highlightsAr: ["خ"],
	};
	const project = (featured: boolean, translated: boolean) => ({
		featured,
		title: "P",
		titleAr: translated ? "م" : null,
		subtitle: "",
		subtitleAr: null,
		summary: "",
		summaryAr: null,
		description: "",
		descriptionAr: null,
		role: "",
		roleAr: null,
		challenge: "",
		challengeAr: null,
		outcomes: [],
		outcomesAr: null,
		features: [],
		featuresAr: null,
	});

	test("is false without an Arabic profile, however much else is translated", () => {
		const data = {
			profile: { ...profile, headlineAr: null },
			projects: [project(true, true)],
			services: [translatedService],
			experiences: [experience],
		};
		assert.equal(portfolioHasArabic(data), false);
	});

	test("counts only the projects the home page shows", () => {
		const data = {
			profile,
			projects: [
				project(true, true),
				project(false, false),
				project(false, false),
				project(false, false),
			],
			services: [],
			experiences: [],
		};
		assert.equal(portfolioHasArabic(data), true);
	});

	test("is false when most of the page is still English", () => {
		const data = {
			profile,
			projects: [project(true, false)],
			services: [englishService, translatedService],
			experiences: [{ ...experience, roleAr: null }],
		};
		assert.equal(portfolioHasArabic(data), false);
	});
});
