import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { publicUrl } from "#/lib/public-url";

const request = (url: string, proto?: string) =>
	new Request(url, {
		headers: proto ? { "x-forwarded-proto": proto } : {},
	});

describe("publicUrl", () => {
	test("uses the scheme the visitor used when a proxy terminates TLS", () => {
		assert.equal(
			publicUrl(request("http://mohamedhabib.work/blog/", "https")).href,
			"https://mohamedhabib.work/blog/",
		);
	});

	test("keeps the request's scheme with no proxy, as in local dev", () => {
		assert.equal(
			publicUrl(request("http://localhost:3010/blog")).href,
			"http://localhost:3010/blog",
		);
	});

	test("uses the first scheme when proxies chain the header", () => {
		assert.equal(
			publicUrl(request("http://mohamedhabib.work/", "https, http")).protocol,
			"https:",
		);
	});

	test("ignores an unknown forwarded scheme", () => {
		assert.equal(
			publicUrl(request("http://mohamedhabib.work/", "gopher")).protocol,
			"http:",
		);
	});
});
