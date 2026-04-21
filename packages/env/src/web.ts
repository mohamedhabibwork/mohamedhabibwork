import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
	clientPrefix: "PUBLIC_",
	client: {
		PUBLIC_SERVER_URL: z.url(),
	},
	runtimeEnv: (
		import.meta as unknown as { env: Record<string, string | undefined> }
	).env,
	emptyStringAsUndefined: true,
});
