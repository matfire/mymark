import type { contract } from "@mymark/orpc";
import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";

const link = new RPCLink({
	url: `${import.meta.env.VITE_API_URL}/rpc`,
	// fetch: <-- provide fetch polyfill fetch if needed
	fetch: (request, init) => {
		return globalThis.fetch(request, {
			...init,
			credentials: "include",
		});
	},
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const client: ContractRouterClient<typeof contract> =
	createORPCClient(link);
