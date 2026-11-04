import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { postHref, postSwitchPath } from "#/lib/blog";

describe("postHref", () => {
	test("an Arabic post links to its /ar URL whichever locale is showing", () => {
		assert.equal(
			postHref({ slug: "nodejs-26-lts", locale: "ar" }),
			"/ar/blog/nodejs-26-lts",
		);
	});

	test("an English post links to its unprefixed URL", () => {
		assert.equal(postHref({ slug: "hello", locale: "en" }), "/blog/hello");
	});
});

describe("postSwitchPath", () => {
	test("a paired post switches to its translation", () => {
		assert.equal(postSwitchPath("hello-ar"), "/blog/hello-ar");
	});

	test("an unpaired post switches to the blog index, since it has no other version", () => {
		assert.equal(postSwitchPath(null), "/blog");
		assert.equal(postSwitchPath(undefined), "/blog");
	});
});
