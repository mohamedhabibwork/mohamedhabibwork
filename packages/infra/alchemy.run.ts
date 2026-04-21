import alchemy from "alchemy";
import { SvelteKit, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("habib-app");

export const web = await SvelteKit("web", {
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
	},
	dev: {
		port: 3000,
	},
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
