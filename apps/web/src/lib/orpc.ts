import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/svelte-query";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			console.error(`Error: ${error.message}`);
		},
	}),
});

const link = new RPCLink({
	url: () => {
		if (typeof window === "undefined") {
			throw new Error("Client link is not allowed on the server side");
		}

		return `${window.location.origin}/rpc`;
	},
});

const client = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client) as unknown as ORPCUtils;

// Typed wrapper for the oRPC TanStack Query utils
// We define this manually since the server-side AppRouter type
// doesn't directly satisfy the NestedClient constraint.
interface ORPCUtils {
	contact: MutationProcedureUtils<
		{
			name: string;
			email: string;
			subject: string;
			message: string;
		},
		{ success: boolean; message: string }
	>;
	experience: ProcedureUtils<import("@habib-app/api/data").ExperienceEntry[]>;
	industries: ProcedureUtils<{
		items: import("@habib-app/api/data").Industry[];
	}>;
	profile: ProcedureUtils<import("@habib-app/api/data").Profile | null>;
	projects: ProcedureUtils<{
		projects: import("@habib-app/api/data").Project[];
		categories: string[];
	}>;
	skills: ProcedureUtils<import("@habib-app/api/data").Skills>;
}

interface ProcedureUtils<TOutput> {
	call(): Promise<TOutput>;
	queryOptions(): {
		queryKey: unknown[];
		queryFn: () => Promise<TOutput>;
	};
}

interface MutationProcedureUtils<TInput, TOutput> {
	call(input: TInput): Promise<TOutput>;
	mutationOptions(): {
		mutationFn: (input: TInput) => Promise<TOutput>;
	};
}
