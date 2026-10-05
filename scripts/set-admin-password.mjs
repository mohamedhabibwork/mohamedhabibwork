// Sets a new dashboard password: prompts (hidden), hashes it, writes ADMIN_PASSWORD_HASH to
// .env.local and uploads it as the Worker secret. The password itself is never stored or printed.
//   bun run set-admin-password
import { spawnSync } from "node:child_process";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const MIN_LENGTH = 12;
const ITERATIONS = 100_000;
const ENV_FILE = ".env.local";
const KEY = "ADMIN_PASSWORD_HASH";

/** Reads one line from the terminal without echoing it. */
function promptHidden(question) {
	return new Promise((resolve, reject) => {
		const { stdin, stdout } = process;
		if (!stdin.isTTY) return reject(new Error("Run this in an interactive terminal."));
		stdout.write(question);
		stdin.setRawMode(true);
		stdin.resume();
		stdin.setEncoding("utf8");
		let value = "";
		const onData = (ch) => {
			if (ch === "\r" || ch === "\n") {
				stdin.setRawMode(false);
				stdin.pause();
				stdin.off("data", onData);
				stdout.write("\n");
				resolve(value);
			} else if (ch === "\u0003") {
				stdout.write("\n");
				process.exit(130);
			} else if (ch === "\u007f") {
				value = value.slice(0, -1);
			} else {
				value += ch;
			}
		};
		stdin.on("data", onData);
	});
}

const hashPassword = (password) => {
	const salt = randomBytes(16);
	return `pbkdf2:${ITERATIONS}:${salt.toString("hex")}:${pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256").toString("hex")}`;
};

function writeEnv(hash) {
	const lines = readFileSync(ENV_FILE, "utf8").split("\n");
	const i = lines.findIndex((l) => l.startsWith(`${KEY}=`));
	if (i >= 0) lines[i] = `${KEY}=${hash}`;
	else lines.push(`${KEY}=${hash}`);
	writeFileSync(ENV_FILE, lines.join("\n"));
}

const password = await promptHidden(`New dashboard password (${MIN_LENGTH}+ characters): `);
if (password.length < MIN_LENGTH) {
	console.error(`Too short: use at least ${MIN_LENGTH} characters.`);
	process.exit(1);
}
if ((await promptHidden("Repeat it: ")) !== password) {
	console.error("Passwords don't match. Nothing changed.");
	process.exit(1);
}

const hash = hashPassword(password);
writeEnv(hash);
console.log(`Updated ${KEY} in ${ENV_FILE}.`);

const res = spawnSync("./node_modules/.bin/wrangler", ["secret", "put", KEY], { input: hash, stdio: ["pipe", "inherit", "inherit"] });
if (res.status !== 0) {
	console.error("Uploading to Cloudflare failed. Retry with: node scripts/env-value.mjs ADMIN_PASSWORD_HASH | ./node_modules/.bin/wrangler secret put ADMIN_PASSWORD_HASH");
	process.exit(1);
}
console.log("Done. Restart `bun run dev` to use it locally; production uses it immediately.");
