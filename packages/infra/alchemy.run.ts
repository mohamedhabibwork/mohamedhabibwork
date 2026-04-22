import alchemy from "alchemy";
import { SvelteKit, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("api-mohamedhabibwork");

export const web = await SvelteKit("mohamedhabibwork", {
	cwd: "../../apps/web",
	bindings: {
		PUBLIC_SERVER_URL: alchemy.env.PUBLIC_SERVER_URL || "mohamedhabib.work",
	},
});

export const server = await Worker("server", {
	cwd: "../../apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		DATABASE_URL:
			alchemy.secret.env.DATABASE_URL ||
			"postgresql://postgres:@localhost:5432/profile",
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN || "mohamedhabib.work,mohamedhabib.me",
		SMTP_HOST: alchemy.secret.env.SMTP_HOST || "81.208.166.110",
		SMTP_PORT: alchemy.secret.env.SMTP_PORT || "1025",
		SMTP_USER: alchemy.secret.env.SMTP_USER || "",
		SMTP_PASS: alchemy.secret.env.SMTP_PASS || "",
		SMTP_FROM: alchemy.env.SMTP_FROM || "noreply@mohamedhabib.work",
		SMTP_TO: alchemy.secret.env.SMTP_TO || "",
	},
	dev: {
		port: 3000,
	},
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
