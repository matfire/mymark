import { contract } from "@mymark/orpc";
import { implement, ORPCError } from "@orpc/server";
import type { RequestHeadersPluginContext } from "@orpc/server/plugins";
import { auth } from "@/lib/auth";

export const os = implement(contract)
	.$context<RequestHeadersPluginContext>()
	.use(async ({ context, next }) => {
		const sessionData = await auth.api.getSession({
			headers: context.reqHeaders, // or reqHeaders if you're using the plugin
		});

		if (!sessionData?.session || !sessionData?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		// Adds session and user to the context
		return next({
			context: {
				session: sessionData.session,
				user: sessionData.user,
			},
		});
	});
