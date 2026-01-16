import "dotenv/config";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.js";
import { router } from "./orpc/index.js";
import { repoManager } from "./sync/manager.js";

const app = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use("/*", cors({ credentials: true, origin: process.env.APP_URL! }));
app.use(logger());

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

const handler = new RPCHandler(router, {});

app.use("/rpc/*", async (c, next) => {
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/rpc",
		context: {
			reqHeaders: c.req.raw.headers,
		}, // Provide initial context if needed
	});

	if (matched) {
		return c.newResponse(response.body, response);
	}

	await next();
});

app.get(
	"/automerge",
	async (c, next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!session) {
			return c.text("Unauthorized", 401);
		}
		c.set("user", session.user);
		c.set("session", session.session);
		return next();
	},
	upgradeWebSocket(async (c) => {
		const user = c.get("user");
		let adapter: ReturnType<typeof repoManager.addConnection> | null = null;
		return {
			onOpen(_evt, ws) {
				adapter = repoManager.addConnection(user.id, ws);
				console.log(`[WS] User ${user.id} connected`);
			},
			onMessage(evt, _ws) {
				if (!adapter) return;
				const data = evt.data;
				if (data instanceof Uint8Array) {
					adapter.receiveMessage(data);
				} else if (data instanceof ArrayBuffer) {
					adapter.receiveMessage(new Uint8Array(data));
				} else if (typeof data === "string") {
					// Handle string messages if needed
					adapter.receiveMessage(new TextEncoder().encode(data));
				}
			},
			onClose(_evt, _ws) {
				if (adapter) {
					repoManager.removeConnection(user.id, adapter);
					console.log(`[WS] User ${user.id} disconnected`);
				}
			},
			onError(evt, _ws) {
				console.error(`[WS] Error for user ${user.id}:`, evt);
			},
		};
	}),
);

const server = serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);

injectWebSocket(server);
