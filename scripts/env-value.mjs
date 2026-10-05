// Prints one value from .env.local without a trailing newline, for piping into `wrangler secret put`.
//   node scripts/env-value.mjs MCP_TOKEN | bunx wrangler secret put MCP_TOKEN
import { readFileSync } from "node:fs";

const key = process.argv[2];
if (!key || !/^[A-Z][A-Z0-9_]*$/.test(key)) {
	console.error("Usage: node scripts/env-value.mjs <KEY>");
	process.exit(1);
}
const line = readFileSync(".env.local", "utf8")
	.split("\n")
	.find((l) => l.startsWith(`${key}=`));
if (!line) {
	console.error(`${key} is not set in .env.local`);
	process.exit(1);
}
process.stdout.write(line.slice(key.length + 1).trim().replace(/^(['"])(.*)\1$/, "$2"));
