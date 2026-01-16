import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/solid";
export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: import.meta.env.VITE_API_URL,
	plugins: [passkeyClient()],
});
