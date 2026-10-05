import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

const RESPONSE_TIMEOUT_MS = 15_000;

const rpcError = (status: number, code: number, message: string) =>
	Response.json({ jsonrpc: "2.0", error: { code, message }, id: null }, { status });

/** Runs one stateless JSON-RPC request against `server` and returns its reply. */
export async function handleMcpRequest(request: Request, server: McpServer): Promise<Response> {
	let message: JSONRPCMessage;
	try {
		message = (await request.json()) as JSONRPCMessage;
	} catch {
		return rpcError(400, -32700, "Parse error");
	}

	// Notifications carry no id and get no reply.
	if (!("id" in message) || message.id === undefined) {
		return new Response(null, { status: 202 });
	}

	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
	try {
		const reply = new Promise<JSONRPCMessage>((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error("MCP request timed out")), RESPONSE_TIMEOUT_MS);
			clientTransport.onmessage = (m) => {
				if ("id" in m && m.id === message.id) {
					clearTimeout(timer);
					resolve(m);
				}
			};
		});
		await server.connect(serverTransport);
		await clientTransport.start();
		await clientTransport.send(message);
		return Response.json(await reply);
	} catch (error) {
		console.error("MCP handler error:", error);
		return rpcError(500, -32603, "Internal server error");
	} finally {
		await clientTransport.close();
		await server.close();
	}
}
