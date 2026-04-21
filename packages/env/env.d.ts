import { type server } from "@habib-app/infra/alchemy.run";

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

export type CloudflareEnv = typeof server.Env;

declare global {
	type Env = CloudflareEnv;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare module "cloudflare:workers" {
	// biome-ignore lint/style/noNamespace: Cloudflare Workers type declarations require namespace
	namespace Cloudflare {
		export interface Env extends CloudflareEnv {}
	}
}
