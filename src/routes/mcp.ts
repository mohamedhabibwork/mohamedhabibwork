import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "#/server/auth";
import { createPortfolioMcp } from "#/server/mcp-server";
import { handleMcpRequest } from "#/utils/mcp-handler";

/** True when the request carries `Authorization: Bearer <MCP_TOKEN>`. */
function isOwner(request: Request): boolean {
	const token = process.env.MCP_TOKEN;
	const header = request.headers.get("authorization") ?? "";
	if (!token || token.length < 32 || !header.startsWith("Bearer ")) return false;
	return timingSafeEqual(header.slice(7), token);
}

export const Route = createFileRoute("/mcp")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const hasAuth = request.headers.has("authorization");
				const owner = isOwner(request);
				if (hasAuth && !owner) return Response.json({ error: "Invalid token" }, { status: 401 });
				return handleMcpRequest(request, createPortfolioMcp({ owner }));
			},
		},
	},
});
