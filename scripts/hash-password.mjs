// Prints an ADMIN_PASSWORD_HASH for the dashboard sign-in.
//   node scripts/hash-password.mjs 'your-password'
import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
	console.error("Usage: node scripts/hash-password.mjs '<password of 12+ characters>'");
	process.exit(1);
}
const iterations = 100_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
console.log(`pbkdf2:${iterations}:${salt.toString("hex")}:${hash.toString("hex")}`);
